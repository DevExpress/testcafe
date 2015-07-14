#ifndef SECURITY_CONTEXT_H
#define SECURITY_CONTEXT_H

#include <node.h>
#include <node_object_wrap.h>
#include <v8.h>

#define SECURITY_WIN32 1

#include <sspi.h>
#include <tchar.h>
#include "security_credentials.h"
#include "../worker.h"
#include "nan.h"

extern "C" {
  #include "../kerberos_sspi.h"
  #include "../base64.h"
}

using namespace v8;
using namespace node;

class SecurityContext : public ObjectWrap {  
  public:    
    SecurityContext();
    ~SecurityContext();    

    // Security info package
    PSecPkgInfo m_PkgInfo;
    // Do we have a context
    bool hasContext;
    // Reference to security credentials
    SecurityCredentials *security_credentials;
    // Security context
    CtxtHandle m_Context;
    // Attributes
    DWORD CtxtAttr;
    // Expiry time for ticket
    TimeStamp Expiration;
    // Payload
    char *payload;

    // Has instance check
    static inline bool HasInstance(Handle<Value> val) {
      if (!val->IsObject()) return false;
      Local<Object> obj = val->ToObject();
      return NanNew(constructor_template)->HasInstance(obj);
    };

    // Functions available from V8
    static void Initialize(Handle<Object> target);
    static NAN_METHOD(InitializeContext);
    static NAN_METHOD(InitalizeStep);
    static NAN_METHOD(DecryptMessage);
    static NAN_METHOD(QueryContextAttributes);
    static NAN_METHOD(EncryptMessage);

    // Payload getter
    static NAN_GETTER(PayloadGetter);
    // hasContext getter
    static NAN_GETTER(HasContextGetter);

    // Constructor used for creating new Long objects from C++
    static Persistent<FunctionTemplate> constructor_template;
    
  private:
    // Create a new instance
    static NAN_METHOD(New);
};

#endif
