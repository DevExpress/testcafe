#include "kerberos_context.h"

Persistent<FunctionTemplate> KerberosContext::constructor_template;

KerberosContext::KerberosContext() : ObjectWrap() {
}

KerberosContext::~KerberosContext() {
}

KerberosContext* KerberosContext::New() {
  NanScope();  
  Local<Object> obj = NanNew(constructor_template)->GetFunction()->NewInstance();
  KerberosContext *kerberos_context = ObjectWrap::Unwrap<KerberosContext>(obj);  
  return kerberos_context;
}

NAN_METHOD(KerberosContext::New) {
  NanScope();
  // Create code object
  KerberosContext *kerberos_context = new KerberosContext();
  // Wrap it
  kerberos_context->Wrap(args.This());
  // Return the object
  NanReturnValue(args.This());
}

void KerberosContext::Initialize(v8::Handle<v8::Object> target) {
  // Grab the scope of the call from Node
  NanScope();

  // Define a new function template
  // Local<FunctionTemplate> t = NanNew<FunctionTemplate>(New);
  Local<FunctionTemplate> t = NanNew<v8::FunctionTemplate>(static_cast<NAN_METHOD((*))>(New));
  t->InstanceTemplate()->SetInternalFieldCount(1);
  t->SetClassName(NanNew<String>("KerberosContext"));

  // Get prototype
  Local<ObjectTemplate> proto = t->PrototypeTemplate();

  // Getter for the response
  proto->SetAccessor(NanNew<String>("response"), KerberosContext::ResponseGetter);

  // Set persistent
  NanAssignPersistent(constructor_template, t);

  // Set the symbol
  target->ForceSet(NanNew<String>("KerberosContext"), t->GetFunction());
}

//
// Response Setter / Getter
NAN_GETTER(KerberosContext::ResponseGetter) {
  NanScope();
  gss_client_state *state;

  // Unpack the object
  KerberosContext *context = ObjectWrap::Unwrap<KerberosContext>(args.This());
  // Let's grab the response
  state = context->state;
  // No state no response
  if(state == NULL || state->response == NULL) {
    NanReturnValue(NanNull());
  } else {
    // Return the response
    NanReturnValue(NanNew<String>(state->response));
  }
}









