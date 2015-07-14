#include <node.h>
#include <assert.h>
#include <string.h>
#include <stdlib.h>
#include <v8.h>
#include <node_buffer.h>
#include <cstring>
#include <cmath>
#include <cstdlib>
#include <iostream>
#include <limits>

#define SECURITY_WIN32 1

#include "security_buffer_descriptor.h"
#include "security_buffer.h"

Persistent<FunctionTemplate> SecurityBufferDescriptor::constructor_template;

SecurityBufferDescriptor::SecurityBufferDescriptor() : ObjectWrap() {
}

SecurityBufferDescriptor::SecurityBufferDescriptor(Persistent<Array> arrayObjectPersistent) : ObjectWrap() {
  SecurityBuffer *security_obj = NULL;
  // Get the Local value
  Local<Array> arrayObject = NanNew(arrayObjectPersistent);

  // Safe reference to array
  this->arrayObject = arrayObject;

  // Unpack the array and ensure we have a valid descriptor
  this->secBufferDesc.cBuffers = arrayObject->Length();
  this->secBufferDesc.ulVersion = SECBUFFER_VERSION;

  if(arrayObject->Length() == 1) {
    // Unwrap  the buffer
    security_obj = ObjectWrap::Unwrap<SecurityBuffer>(arrayObject->Get(0)->ToObject());
    // Assign the buffer
    this->secBufferDesc.pBuffers = &security_obj->sec_buffer;
  } else {
    this->secBufferDesc.pBuffers = new SecBuffer[arrayObject->Length()];
    this->secBufferDesc.cBuffers = arrayObject->Length();
    
    // Assign the buffers
    for(uint32_t i = 0; i < arrayObject->Length(); i++) {
      security_obj = ObjectWrap::Unwrap<SecurityBuffer>(arrayObject->Get(i)->ToObject());
      this->secBufferDesc.pBuffers[i].BufferType = security_obj->sec_buffer.BufferType;
      this->secBufferDesc.pBuffers[i].pvBuffer = security_obj->sec_buffer.pvBuffer;
      this->secBufferDesc.pBuffers[i].cbBuffer = security_obj->sec_buffer.cbBuffer;
    }
  }
}

SecurityBufferDescriptor::~SecurityBufferDescriptor() {
}

size_t SecurityBufferDescriptor::bufferSize() {
  SecurityBuffer *security_obj = NULL;

  if(this->secBufferDesc.cBuffers == 1) {
    security_obj = ObjectWrap::Unwrap<SecurityBuffer>(arrayObject->Get(0)->ToObject());
    return security_obj->size;
  } else {
    int bytesToAllocate = 0;

    for(unsigned int i = 0; i < this->secBufferDesc.cBuffers; i++) {
      bytesToAllocate += this->secBufferDesc.pBuffers[i].cbBuffer;
    }

    // Return total size
    return bytesToAllocate;
  }
}

char *SecurityBufferDescriptor::toBuffer() {
  SecurityBuffer *security_obj = NULL;
  char *data = NULL;

  if(this->secBufferDesc.cBuffers == 1) {
    security_obj = ObjectWrap::Unwrap<SecurityBuffer>(arrayObject->Get(0)->ToObject());
    data = (char *)malloc(security_obj->size * sizeof(char));
    memcpy(data, security_obj->data, security_obj->size);
  } else {
    size_t bytesToAllocate = this->bufferSize();
    char *data = (char *)calloc(bytesToAllocate, sizeof(char));
    int offset = 0;

    for(unsigned int i = 0; i < this->secBufferDesc.cBuffers; i++) {
      memcpy((data + offset), this->secBufferDesc.pBuffers[i].pvBuffer, this->secBufferDesc.pBuffers[i].cbBuffer);
      offset +=this->secBufferDesc.pBuffers[i].cbBuffer;
    }

    // Return the data
    return data;
  }

  return data;
}

NAN_METHOD(SecurityBufferDescriptor::New) {
  NanScope();
  SecurityBufferDescriptor *security_obj;
  Persistent<Array> arrayObject;

  if(args.Length() != 1)
    return NanThrowError("There must be 1 argument passed in where the first argument is a [int32 or an Array of SecurityBuffers]");

  if(!args[0]->IsInt32() && !args[0]->IsArray())
    return NanThrowError("There must be 1 argument passed in where the first argument is a [int32 or an Array of SecurityBuffers]");

  if(args[0]->IsArray()) {
    Handle<Array> array = Handle<Array>::Cast(args[0]);
    // Iterate over all items and ensure we the right type
    for(uint32_t i = 0; i < array->Length(); i++) {
      if(!SecurityBuffer::HasInstance(array->Get(i))) {
        return NanThrowError("There must be 1 argument passed in where the first argument is a [int32 or an Array of SecurityBuffers]");
      }
    }
  }

  // We have a single integer
  if(args[0]->IsInt32()) {
    // Create new SecurityBuffer instance
    Local<Value> argv[] = {NanNew<Int32>(0x02), args[0]};
    Handle<Value> security_buffer = NanNew(SecurityBuffer::constructor_template)->GetFunction()->NewInstance(2, argv);
    // Create a new array
    Local<Array> array = NanNew<Array>(1);
    // Set the first value
    array->Set(0, security_buffer);

    // Create persistent handle
    Persistent<Array> persistenHandler;
    NanAssignPersistent(persistenHandler, array);

    // Create descriptor
    security_obj = new SecurityBufferDescriptor(persistenHandler);
  } else {
    // Create a persistent handler
    Persistent<Array> persistenHandler;
    NanAssignPersistent(persistenHandler, Handle<Array>::Cast(args[0]));
    // Create a descriptor
    security_obj = new SecurityBufferDescriptor(persistenHandler);
  }

  // Wrap it
  security_obj->Wrap(args.This());
  // Return the object
  NanReturnValue(args.This());
}

NAN_METHOD(SecurityBufferDescriptor::ToBuffer) {
  NanScope();

  // Unpack the Security Buffer object
  SecurityBufferDescriptor *security_obj = ObjectWrap::Unwrap<SecurityBufferDescriptor>(args.This());

  // Get the buffer
  char *buffer_data = security_obj->toBuffer();
  size_t buffer_size = security_obj->bufferSize();

  // Create a Buffer
  Local<Object> buffer = NanNewBufferHandle(buffer_data, buffer_size);

  // Return the buffer
  NanReturnValue(buffer);
}

void SecurityBufferDescriptor::Initialize(Handle<Object> target) {
  // Grab the scope of the call from Node
  NanScope();

  // Define a new function template
  Local<FunctionTemplate> t = NanNew<FunctionTemplate>(New);
  t->InstanceTemplate()->SetInternalFieldCount(1);
  t->SetClassName(NanNew<String>("SecurityBufferDescriptor"));

  // Class methods
  NODE_SET_PROTOTYPE_METHOD(t, "toBuffer", ToBuffer);

  // Set persistent
  NanAssignPersistent(constructor_template, t);

  // Set the symbol
  target->ForceSet(NanNew<String>("SecurityBufferDescriptor"), t->GetFunction());
}
