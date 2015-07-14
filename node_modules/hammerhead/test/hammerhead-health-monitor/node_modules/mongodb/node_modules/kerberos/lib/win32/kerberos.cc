#include "kerberos.h"
#include <stdlib.h>
#include <tchar.h>
#include "base64.h"
#include "wrappers/security_buffer.h"
#include "wrappers/security_buffer_descriptor.h"
#include "wrappers/security_context.h"
#include "wrappers/security_credentials.h"

Persistent<FunctionTemplate> Kerberos::constructor_template;

Kerberos::Kerberos() : ObjectWrap() {
}

void Kerberos::Initialize(v8::Handle<v8::Object> target) {
  // Grab the scope of the call from Node
  NanScope();

  // Define a new function template
  Local<FunctionTemplate> t = NanNew<FunctionTemplate>(New);
  t->InstanceTemplate()->SetInternalFieldCount(1);
  t->SetClassName(NanNew<String>("Kerberos"));

  // Set persistent
  NanAssignPersistent(constructor_template, t);

  // Set the symbol
  target->ForceSet(NanNew<String>("Kerberos"), t->GetFunction());
}

NAN_METHOD(Kerberos::New) {
  NanScope();
  // Load the security.dll library
  load_library();
  // Create a Kerberos instance
  Kerberos *kerberos = new Kerberos();
  // Return the kerberos object
  kerberos->Wrap(args.This());
  // Return the object
  NanReturnValue(args.This());
}

// Exporting function
extern "C" void init(Handle<Object> target) {
  NanScope();
  Kerberos::Initialize(target);
  SecurityContext::Initialize(target);
  SecurityBuffer::Initialize(target);
  SecurityBufferDescriptor::Initialize(target);
  SecurityCredentials::Initialize(target);
}

NODE_MODULE(kerberos, init);
