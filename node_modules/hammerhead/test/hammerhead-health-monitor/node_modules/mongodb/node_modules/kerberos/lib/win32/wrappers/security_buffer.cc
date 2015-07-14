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

#include "security_buffer.h"

using namespace node;

Persistent<FunctionTemplate> SecurityBuffer::constructor_template;

SecurityBuffer::SecurityBuffer(uint32_t security_type, size_t size) : ObjectWrap() {
  this->size = size;
  this->data = calloc(size, sizeof(char));
  this->security_type = security_type;
  // Set up the data in the sec_buffer
  this->sec_buffer.BufferType = security_type;
  this->sec_buffer.cbBuffer = (unsigned long)size;
  this->sec_buffer.pvBuffer = this->data;  
}

SecurityBuffer::SecurityBuffer(uint32_t security_type, size_t size, void *data) : ObjectWrap() {
  this->size = size;
  this->data = data;
  this->security_type = security_type;
  // Set up the data in the sec_buffer
  this->sec_buffer.BufferType = security_type;
  this->sec_buffer.cbBuffer = (unsigned long)size;
  this->sec_buffer.pvBuffer = this->data;  
}

SecurityBuffer::~SecurityBuffer() {
  free(this->data);
}

NAN_METHOD(SecurityBuffer::New) {
  NanScope();
  SecurityBuffer *security_obj;

  if(args.Length() != 2)
    return NanThrowError("Two parameters needed integer buffer type and  [32 bit integer/Buffer] required");

  if(!args[0]->IsInt32())
    return NanThrowError("Two parameters needed integer buffer type and  [32 bit integer/Buffer] required");

  if(!args[1]->IsInt32() && !Buffer::HasInstance(args[1]))
    return NanThrowError("Two parameters needed integer buffer type and  [32 bit integer/Buffer] required");

  // Unpack buffer type
  uint32_t buffer_type = args[0]->ToUint32()->Value();

  // If we have an integer
  if(args[1]->IsInt32()) {
    security_obj = new SecurityBuffer(buffer_type, args[1]->ToUint32()->Value());
  } else {
    // Get the length of the Buffer
    size_t length = Buffer::Length(args[1]->ToObject());
    // Allocate space for the internal void data pointer
    void *data = calloc(length, sizeof(char));
    // Write the data to out of V8 heap space
    memcpy(data, Buffer::Data(args[1]->ToObject()), length);
    // Create new SecurityBuffer
    security_obj = new SecurityBuffer(buffer_type, length, data);
  }
  
  // Wrap it
  security_obj->Wrap(args.This());
  // Return the object
  NanReturnValue(args.This());
}

NAN_METHOD(SecurityBuffer::ToBuffer) {
  NanScope();
  // Unpack the Security Buffer object
  SecurityBuffer *security_obj = ObjectWrap::Unwrap<SecurityBuffer>(args.This());
  // Create a Buffer
  Local<Object> buffer = NanNewBufferHandle((char *)security_obj->data, (size_t)security_obj->size);
  // Return the buffer
  NanReturnValue(buffer);
}

void SecurityBuffer::Initialize(Handle<Object> target) {
  // Grab the scope of the call from Node
  NanScope();

  // Define a new function template
  Local<FunctionTemplate> t = NanNew<FunctionTemplate>(New);
  t->InstanceTemplate()->SetInternalFieldCount(1);
  t->SetClassName(NanNew<String>("SecurityBuffer"));

  // Class methods
  NODE_SET_PROTOTYPE_METHOD(t, "toBuffer", ToBuffer);

  // Set persistent
  NanAssignPersistent(constructor_template, t);

  // Set the symbol
  target->ForceSet(NanNew<String>("SecurityBuffer"), t->GetFunction());
}
