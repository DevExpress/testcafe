#include "kerberos.h"
#include <stdlib.h>
#include <errno.h>
#include "worker.h"
#include "kerberos_context.h"

#ifndef ARRAY_SIZE
# define ARRAY_SIZE(a) (sizeof((a)) / sizeof((a)[0]))
#endif

void die(const char *message) {
  if(errno) {
    perror(message);
  } else {
    printf("ERROR: %s\n", message);
  }

  exit(1);
}

// Call structs
typedef struct AuthGSSClientCall {
  uint32_t  flags;
  char *uri;
} AuthGSSClientCall;

typedef struct AuthGSSClientStepCall {
  KerberosContext *context;
  char *challenge;
} AuthGSSClientStepCall;

typedef struct AuthGSSClientUnwrapCall {
  KerberosContext *context;
  char *challenge;
} AuthGSSClientUnwrapCall;

typedef struct AuthGSSClientWrapCall {
  KerberosContext *context;
  char *challenge;
  char *user_name;
} AuthGSSClientWrapCall;

typedef struct AuthGSSClientCleanCall {
  KerberosContext *context;
} AuthGSSClientCleanCall;

Kerberos::Kerberos() : ObjectWrap() {
}

Persistent<FunctionTemplate> Kerberos::constructor_template;

void Kerberos::Initialize(v8::Handle<v8::Object> target) {
  // Grab the scope of the call from Node
  NanScope();

  // Define a new function template
  Local<FunctionTemplate> t = NanNew<FunctionTemplate>(New);
  t->InstanceTemplate()->SetInternalFieldCount(1);
  t->SetClassName(NanNew<String>("Kerberos"));

  // Set up method for the Kerberos instance
  NODE_SET_PROTOTYPE_METHOD(t, "authGSSClientInit", AuthGSSClientInit);  
  NODE_SET_PROTOTYPE_METHOD(t, "authGSSClientStep", AuthGSSClientStep);  
  NODE_SET_PROTOTYPE_METHOD(t, "authGSSClientUnwrap", AuthGSSClientUnwrap);
  NODE_SET_PROTOTYPE_METHOD(t, "authGSSClientWrap", AuthGSSClientWrap);
  NODE_SET_PROTOTYPE_METHOD(t, "authGSSClientClean", AuthGSSClientClean);

  NanAssignPersistent(constructor_template, t);

  // Set the symbol
  target->ForceSet(NanNew<String>("Kerberos"), t->GetFunction());
}

NAN_METHOD(Kerberos::New) {
  NanScope();
  // Create a Kerberos instance
  Kerberos *kerberos = new Kerberos();
  // Return the kerberos object
  kerberos->Wrap(args.This());
  NanReturnValue(args.This());
}

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// authGSSClientInit
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
static void _authGSSClientInit(Worker *worker) {
  gss_client_state *state;
  gss_client_response *response;

  // Allocate state
  state = (gss_client_state *)malloc(sizeof(gss_client_state));
  if(state == NULL) die("Memory allocation failed");
  
  // Unpack the parameter data struct
  AuthGSSClientCall *call = (AuthGSSClientCall *)worker->parameters;
  // Start the kerberos client
  response = authenticate_gss_client_init(call->uri, call->flags, state);

  // Release the parameter struct memory
  free(call->uri);
  free(call);

  // If we have an error mark worker as having had an error
  if(response->return_code == AUTH_GSS_ERROR) {
    worker->error = TRUE;
    worker->error_code = response->return_code;
    worker->error_message = response->message;
    free(state);
  } else {
    worker->return_value = state;
  }

  // Free structure
  free(response);
}

static Handle<Value> _map_authGSSClientInit(Worker *worker) {
  KerberosContext *context = KerberosContext::New();
  context->state = (gss_client_state *)worker->return_value;
  return NanObjectWrapHandle(context);
}

// Initialize method
NAN_METHOD(Kerberos::AuthGSSClientInit) {
  NanScope();

  // Ensure valid call
  if(args.Length() != 3) return NanThrowError("Requires a service string uri, integer flags and a callback function");
  if(args.Length() == 3 && !args[0]->IsString() && !args[1]->IsInt32() && !args[2]->IsFunction()) 
      return NanThrowError("Requires a service string uri, integer flags and a callback function");    

  Local<String> service = args[0]->ToString();
  // Convert uri string to c-string
  char *service_str = (char *)calloc(service->Utf8Length() + 1, sizeof(char));
  if(service_str == NULL) die("Memory allocation failed");

  // Write v8 string to c-string
  service->WriteUtf8(service_str);

  // Allocate a structure
  AuthGSSClientCall *call = (AuthGSSClientCall *)calloc(1, sizeof(AuthGSSClientCall));
  if(call == NULL) die("Memory allocation failed");
  call->flags =args[1]->ToInt32()->Uint32Value();
  call->uri = service_str;

  // Unpack the callback
  Local<Function> callbackHandle = Local<Function>::Cast(args[2]);
  NanCallback *callback = new NanCallback(callbackHandle);

  // Let's allocate some space
  Worker *worker = new Worker();
  worker->error = false;
  worker->request.data = worker;
  worker->callback = callback;
  worker->parameters = call;
  worker->execute = _authGSSClientInit;
  worker->mapper = _map_authGSSClientInit;

  // Schedule the worker with lib_uv
  uv_queue_work(uv_default_loop(), &worker->request, Kerberos::Process, (uv_after_work_cb)Kerberos::After);
  // Return no value as it's callback based
  NanReturnValue(NanUndefined());
}

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// authGSSClientStep
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
static void _authGSSClientStep(Worker *worker) {
  gss_client_state *state;
  gss_client_response *response;
  char *challenge;

  // Unpack the parameter data struct
  AuthGSSClientStepCall *call = (AuthGSSClientStepCall *)worker->parameters;
  // Get the state
  state = call->context->state;
  challenge = call->challenge;

  // Check what kind of challenge we have
  if(call->challenge == NULL) {
    challenge = (char *)"";
  }

  // Perform authentication step
  response = authenticate_gss_client_step(state, challenge);

  // If we have an error mark worker as having had an error
  if(response->return_code == AUTH_GSS_ERROR) {
    worker->error = TRUE;
    worker->error_code = response->return_code;
    worker->error_message = response->message;
  } else {
    worker->return_code = response->return_code;
  }

  // Free up structure
  if(call->challenge != NULL) free(call->challenge);
  free(call);
  free(response);
}

static Handle<Value> _map_authGSSClientStep(Worker *worker) {
  NanScope();
  // Return the return code
  return NanNew<Int32>(worker->return_code);
}

// Initialize method
NAN_METHOD(Kerberos::AuthGSSClientStep) {
  NanScope();

  // Ensure valid call
  if(args.Length() != 2 && args.Length() != 3) return NanThrowError("Requires a GSS context, optional challenge string and callback function");
  if(args.Length() == 2 && !KerberosContext::HasInstance(args[0])) return NanThrowError("Requires a GSS context, optional challenge string and callback function");
  if(args.Length() == 3 && !KerberosContext::HasInstance(args[0]) && !args[1]->IsString()) return NanThrowError("Requires a GSS context, optional challenge string and callback function");

  // Challenge string
  char *challenge_str = NULL;
  // Let's unpack the parameters
  Local<Object> object = args[0]->ToObject();
  KerberosContext *kerberos_context = KerberosContext::Unwrap<KerberosContext>(object);

  // If we have a challenge string
  if(args.Length() == 3) {
    // Unpack the challenge string
    Local<String> challenge = args[1]->ToString();
    // Convert uri string to c-string
    challenge_str = (char *)calloc(challenge->Utf8Length() + 1, sizeof(char));
    if(challenge_str == NULL) die("Memory allocation failed");
    // Write v8 string to c-string
    challenge->WriteUtf8(challenge_str);    
  }

  // Allocate a structure
  AuthGSSClientStepCall *call = (AuthGSSClientStepCall *)calloc(1, sizeof(AuthGSSClientCall));
  if(call == NULL) die("Memory allocation failed");
  call->context = kerberos_context;
  call->challenge = challenge_str;

  // Unpack the callback
  Local<Function> callbackHandle = Local<Function>::Cast(args[2]);
  NanCallback *callback = new NanCallback(callbackHandle);

  // Let's allocate some space
  Worker *worker = new Worker();
  worker->error = false;
  worker->request.data = worker;
  worker->callback = callback;
  worker->parameters = call;
  worker->execute = _authGSSClientStep;
  worker->mapper = _map_authGSSClientStep;

  // Schedule the worker with lib_uv
  uv_queue_work(uv_default_loop(), &worker->request, Kerberos::Process, (uv_after_work_cb)Kerberos::After);

  // Return no value as it's callback based
  NanReturnValue(NanUndefined());
}

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// authGSSClientUnwrap
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
static void _authGSSClientUnwrap(Worker *worker) {
  gss_client_response *response;
  char *challenge;

  // Unpack the parameter data struct
  AuthGSSClientUnwrapCall *call = (AuthGSSClientUnwrapCall *)worker->parameters;
  challenge = call->challenge;

  // Check what kind of challenge we have
  if(call->challenge == NULL) {
    challenge = (char *)"";
  }

  // Perform authentication step
  response = authenticate_gss_client_unwrap(call->context->state, challenge);

  // If we have an error mark worker as having had an error
  if(response->return_code == AUTH_GSS_ERROR) {
    worker->error = TRUE;
    worker->error_code = response->return_code;
    worker->error_message = response->message;
  } else {
    worker->return_code = response->return_code;
  }

  // Free up structure
  if(call->challenge != NULL) free(call->challenge);
  free(call);
  free(response);
}

static Handle<Value> _map_authGSSClientUnwrap(Worker *worker) {
  NanScope();
  // Return the return code
  return NanNew<Int32>(worker->return_code);
}

// Initialize method
NAN_METHOD(Kerberos::AuthGSSClientUnwrap) {
  NanScope();

  // Ensure valid call
  if(args.Length() != 2 && args.Length() != 3) return NanThrowError("Requires a GSS context, optional challenge string and callback function");
  if(args.Length() == 2 && !KerberosContext::HasInstance(args[0]) && !args[1]->IsFunction()) return NanThrowError("Requires a GSS context, optional challenge string and callback function");
  if(args.Length() == 3 && !KerberosContext::HasInstance(args[0]) && !args[1]->IsString() && !args[2]->IsFunction()) return NanThrowError("Requires a GSS context, optional challenge string and callback function");

  // Challenge string
  char *challenge_str = NULL;
  // Let's unpack the parameters
  Local<Object> object = args[0]->ToObject();
  KerberosContext *kerberos_context = KerberosContext::Unwrap<KerberosContext>(object);

  // If we have a challenge string
  if(args.Length() == 3) {
    // Unpack the challenge string
    Local<String> challenge = args[1]->ToString();
    // Convert uri string to c-string
    challenge_str = (char *)calloc(challenge->Utf8Length() + 1, sizeof(char));
    if(challenge_str == NULL) die("Memory allocation failed");
    // Write v8 string to c-string
    challenge->WriteUtf8(challenge_str);    
  }

  // Allocate a structure
  AuthGSSClientUnwrapCall *call = (AuthGSSClientUnwrapCall *)calloc(1, sizeof(AuthGSSClientUnwrapCall));
  if(call == NULL) die("Memory allocation failed");
  call->context = kerberos_context;
  call->challenge = challenge_str;

  // Unpack the callback
  Local<Function> callbackHandle = args.Length() == 3 ? Local<Function>::Cast(args[2]) : Local<Function>::Cast(args[1]);
  NanCallback *callback = new NanCallback(callbackHandle);

  // Let's allocate some space
  Worker *worker = new Worker();
  worker->error = false;
  worker->request.data = worker;
  worker->callback = callback;
  worker->parameters = call;
  worker->execute = _authGSSClientUnwrap;
  worker->mapper = _map_authGSSClientUnwrap;

  // Schedule the worker with lib_uv
  uv_queue_work(uv_default_loop(), &worker->request, Kerberos::Process, (uv_after_work_cb)Kerberos::After);

  // Return no value as it's callback based
  // return scope.Close(NanUndefined());
  NanReturnValue(NanUndefined());
}

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// authGSSClientWrap
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
static void _authGSSClientWrap(Worker *worker) {
  gss_client_response *response;
  char *user_name = NULL;

  // Unpack the parameter data struct
  AuthGSSClientWrapCall *call = (AuthGSSClientWrapCall *)worker->parameters;
  user_name = call->user_name;  

  // Check what kind of challenge we have
  if(call->user_name == NULL) {
    user_name = (char *)"";
  }

  // Perform authentication step
  response = authenticate_gss_client_wrap(call->context->state, call->challenge, user_name);

  // If we have an error mark worker as having had an error
  if(response->return_code == AUTH_GSS_ERROR) {
    worker->error = TRUE;
    worker->error_code = response->return_code;
    worker->error_message = response->message;
  } else {
    worker->return_code = response->return_code;
  }

  // Free up structure
  if(call->challenge != NULL) free(call->challenge);
  if(call->user_name != NULL) free(call->user_name);
  free(call);
  free(response);
}

static Handle<Value> _map_authGSSClientWrap(Worker *worker) {
  NanScope();
  // Return the return code
  return NanNew<Int32>(worker->return_code);
}

// Initialize method
NAN_METHOD(Kerberos::AuthGSSClientWrap) {
  NanScope();

  // Ensure valid call
  if(args.Length() != 3 && args.Length() != 4) return NanThrowError("Requires a GSS context, the result from the authGSSClientResponse after authGSSClientUnwrap, optional user name and callback function");
  if(args.Length() == 3 && !KerberosContext::HasInstance(args[0]) && !args[1]->IsString() && !args[2]->IsFunction()) return NanThrowError("Requires a GSS context, the result from the authGSSClientResponse after authGSSClientUnwrap, optional user name and callback function");
  if(args.Length() == 4 && !KerberosContext::HasInstance(args[0]) && !args[1]->IsString() && !args[2]->IsString() && !args[2]->IsFunction()) return NanThrowError("Requires a GSS context, the result from the authGSSClientResponse after authGSSClientUnwrap, optional user name and callback function");

  // Challenge string
  char *challenge_str = NULL;
  char *user_name_str = NULL;
  
  // Let's unpack the kerberos context
  Local<Object> object = args[0]->ToObject();
  KerberosContext *kerberos_context = KerberosContext::Unwrap<KerberosContext>(object);

  // Unpack the challenge string
  Local<String> challenge = args[1]->ToString();
  // Convert uri string to c-string
  challenge_str = (char *)calloc(challenge->Utf8Length() + 1, sizeof(char));
  if(challenge_str == NULL) die("Memory allocation failed");
  // Write v8 string to c-string
  challenge->WriteUtf8(challenge_str);    

  // If we have a user string
  if(args.Length() == 4) {
    // Unpack user name
    Local<String> user_name = args[2]->ToString();
    // Convert uri string to c-string
    user_name_str = (char *)calloc(user_name->Utf8Length() + 1, sizeof(char));
    if(user_name_str == NULL) die("Memory allocation failed");
    // Write v8 string to c-string
    user_name->WriteUtf8(user_name_str);
  }

  // Allocate a structure
  AuthGSSClientWrapCall *call = (AuthGSSClientWrapCall *)calloc(1, sizeof(AuthGSSClientWrapCall));
  if(call == NULL) die("Memory allocation failed");
  call->context = kerberos_context;
  call->challenge = challenge_str;
  call->user_name = user_name_str;

  // Unpack the callback
  Local<Function> callbackHandle = args.Length() == 4 ? Local<Function>::Cast(args[3]) : Local<Function>::Cast(args[2]);
  NanCallback *callback = new NanCallback(callbackHandle);

  // Let's allocate some space
  Worker *worker = new Worker();
  worker->error = false;
  worker->request.data = worker;
  worker->callback = callback;
  worker->parameters = call;
  worker->execute = _authGSSClientWrap;
  worker->mapper = _map_authGSSClientWrap;

  // Schedule the worker with lib_uv
  uv_queue_work(uv_default_loop(), &worker->request, Kerberos::Process, (uv_after_work_cb)Kerberos::After);

  // Return no value as it's callback based
  NanReturnValue(NanUndefined());
}

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// authGSSClientWrap
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
static void _authGSSClientClean(Worker *worker) {
  gss_client_response *response;

  // Unpack the parameter data struct
  AuthGSSClientCleanCall *call = (AuthGSSClientCleanCall *)worker->parameters;

  // Perform authentication step
  response = authenticate_gss_client_clean(call->context->state);

  // If we have an error mark worker as having had an error
  if(response->return_code == AUTH_GSS_ERROR) {
    worker->error = TRUE;
    worker->error_code = response->return_code;
    worker->error_message = response->message;
  } else {
    worker->return_code = response->return_code;
  }

  // Free up structure
  free(call);
  free(response);
}

static Handle<Value> _map_authGSSClientClean(Worker *worker) {
  NanScope();
  // Return the return code
  return NanNew<Int32>(worker->return_code);
}

// Initialize method
NAN_METHOD(Kerberos::AuthGSSClientClean) {
  NanScope();

  // // Ensure valid call
  if(args.Length() != 2) return NanThrowError("Requires a GSS context and callback function");
  if(!KerberosContext::HasInstance(args[0]) && !args[1]->IsFunction()) return NanThrowError("Requires a GSS context and callback function");

  // Let's unpack the kerberos context
  Local<Object> object = args[0]->ToObject();
  KerberosContext *kerberos_context = KerberosContext::Unwrap<KerberosContext>(object);

  // Allocate a structure
  AuthGSSClientCleanCall *call = (AuthGSSClientCleanCall *)calloc(1, sizeof(AuthGSSClientCleanCall));
  if(call == NULL) die("Memory allocation failed");
  call->context = kerberos_context;

  // Unpack the callback
  Local<Function> callbackHandle = Local<Function>::Cast(args[1]);
  NanCallback *callback = new NanCallback(callbackHandle);

  // Let's allocate some space
  Worker *worker = new Worker();
  worker->error = false;
  worker->request.data = worker;
  worker->callback = callback;
  worker->parameters = call;
  worker->execute = _authGSSClientClean;
  worker->mapper = _map_authGSSClientClean;

  // Schedule the worker with lib_uv
  uv_queue_work(uv_default_loop(), &worker->request, Kerberos::Process, (uv_after_work_cb)Kerberos::After);

  // Return no value as it's callback based
  NanReturnValue(NanUndefined());
}

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// UV Lib callbacks
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
void Kerberos::Process(uv_work_t* work_req) {
  // Grab the worker
  Worker *worker = static_cast<Worker*>(work_req->data);
  // Execute the worker code
  worker->execute(worker);
}

void Kerberos::After(uv_work_t* work_req) {
  // Grab the scope of the call from Node
  NanScope();

  // Get the worker reference
  Worker *worker = static_cast<Worker*>(work_req->data);

  // If we have an error
  if(worker->error) {
    Local<Value> err = v8::Exception::Error(NanNew<String>(worker->error_message));
    Local<Object> obj = err->ToObject();
    obj->Set(NanNew<String>("code"), NanNew<Int32>(worker->error_code));
    Local<Value> args[2] = { err, NanNull() };
    // Execute the error
    v8::TryCatch try_catch;

    // Call the callback
    worker->callback->Call(ARRAY_SIZE(args), args);

    // If we have an exception handle it as a fatalexception
    if (try_catch.HasCaught()) {
      node::FatalException(try_catch);
    }
  } else {
    // // Map the data
    Handle<Value> result = worker->mapper(worker);
    // Set up the callback with a null first
    Handle<Value> args[2] = { NanNull(), result};

    // Wrap the callback function call in a TryCatch so that we can call
    // node's FatalException afterwards. This makes it possible to catch
    // the exception from JavaScript land using the
    // process.on('uncaughtException') event.
    v8::TryCatch try_catch;

    // Call the callback
    worker->callback->Call(ARRAY_SIZE(args), args);

    // If we have an exception handle it as a fatalexception
    if (try_catch.HasCaught()) {
      node::FatalException(try_catch);
    }
  }

  // Clean up the memory
  delete worker->callback;
  delete worker;
}

// Exporting function
extern "C" void init(Handle<Object> target) {
  NanScope();
  Kerberos::Initialize(target);
  KerberosContext::Initialize(target);
}

NODE_MODULE(kerberos, init);
