/*********************************************************************
 * NAN - Native Abstractions for Node.js
 *
 * Copyright (c) 2014 NAN contributors
 *
 * MIT License <https://github.com/rvagg/nan/blob/master/LICENSE.md>
 ********************************************************************/

#ifndef NAN_IMPLEMENTATION_12_INL_H_
#define NAN_IMPLEMENTATION_12_INL_H_
//==============================================================================
// node v0.11 implementation
//==============================================================================

#include <string>

namespace NanIntern {

//=== Array ====================================================================

Factory<v8::Array>::return_t
Factory<v8::Array>::New() {
  return v8::Array::New(v8::Isolate::GetCurrent());
}

Factory<v8::Array>::return_t
Factory<v8::Array>::New(int length) {
  return v8::Array::New(v8::Isolate::GetCurrent(), length);
}

//=== Boolean ==================================================================

Factory<v8::Boolean>::return_t
Factory<v8::Boolean>::New(bool value) {
  return v8::Boolean::New(v8::Isolate::GetCurrent(), value);
}

//=== Boolean Object ===========================================================

Factory<v8::BooleanObject>::return_t
Factory<v8::BooleanObject>::New(bool value) {
  return v8::BooleanObject::New(value).As<v8::BooleanObject>();
}

//=== Date =====================================================================

Factory<v8::Date>::return_t
Factory<v8::Date>::New(double value) {
  return v8::Date::New(v8::Isolate::GetCurrent(), value).As<v8::Date>();
}

//=== External =================================================================

Factory<v8::External>::return_t
Factory<v8::External>::New(void * value) {
  return v8::External::New(v8::Isolate::GetCurrent(), value);
}

//=== Function Template ========================================================

Factory<v8::FunctionTemplate>::return_t
Factory<v8::FunctionTemplate>::New( NanFunctionCallback callback
                                  , v8::Handle<v8::Value> data
                                  , v8::Handle<v8::Signature> signature) {
  return v8::FunctionTemplate::New(v8::Isolate::GetCurrent(), callback, data,
      signature);
}

//=== Number ===================================================================

Factory<v8::Number>::return_t
Factory<v8::Number>::New(double value) {
  return v8::Number::New(v8::Isolate::GetCurrent(), value);
}

//=== Number Object ============================================================

Factory<v8::NumberObject>::return_t
Factory<v8::NumberObject>::New(double value) {
  return v8::NumberObject::New( v8::Isolate::GetCurrent()
                              , value).As<v8::NumberObject>();
}

//=== Integer, Int32 and Uint32 ================================================

template <typename T>
typename IntegerFactory<T>::return_t
IntegerFactory<T>::New(int32_t value) {
  return To<T>(T::New(v8::Isolate::GetCurrent(), value));
}

template <typename T>
typename IntegerFactory<T>::return_t
IntegerFactory<T>::New(uint32_t value) {
  return To<T>(T::NewFromUnsigned(v8::Isolate::GetCurrent(), value));
}

Factory<v8::Uint32>::return_t
Factory<v8::Uint32>::New(int32_t value) {
  return To<v8::Uint32>(
      v8::Uint32::NewFromUnsigned(v8::Isolate::GetCurrent(), value));
}

Factory<v8::Uint32>::return_t
Factory<v8::Uint32>::New(uint32_t value) {
  return To<v8::Uint32>(
      v8::Uint32::NewFromUnsigned(v8::Isolate::GetCurrent(), value));
}

//=== Object ===================================================================

Factory<v8::Object>::return_t
Factory<v8::Object>::New() {
  return v8::Object::New(v8::Isolate::GetCurrent());
}

//=== RegExp ===================================================================

Factory<v8::RegExp>::return_t
Factory<v8::RegExp>::New(
    v8::Handle<v8::String> pattern
  , v8::RegExp::Flags flags) {
  return v8::RegExp::New(pattern, flags);
}

//=== Script ===================================================================

Factory<v8::Script>::return_t
Factory<v8::Script>::New( v8::Local<v8::String> source) {
  v8::ScriptCompiler::Source src(source);
  return v8::ScriptCompiler::Compile(v8::Isolate::GetCurrent(), &src);
}

Factory<v8::Script>::return_t
Factory<v8::Script>::New( v8::Local<v8::String> source
                        , v8::ScriptOrigin const& origin) {
  v8::ScriptCompiler::Source src(source, origin);
  return v8::ScriptCompiler::Compile(v8::Isolate::GetCurrent(), &src);
}

//=== Signature ================================================================

Factory<v8::Signature>::return_t
Factory<v8::Signature>::New( Factory<v8::Signature>::FTH receiver
                           , int argc
                           , Factory<v8::Signature>::FTH argv[]) {
  return v8::Signature::New(v8::Isolate::GetCurrent(), receiver, argc, argv);
}

//=== String ===================================================================

Factory<v8::String>::return_t
Factory<v8::String>::New(const char * value, int length) {
  return v8::String::NewFromUtf8(v8::Isolate::GetCurrent(), value,
      v8::String::kNormalString, length);
}

Factory<v8::String>::return_t
Factory<v8::String>::New(std::string const& value) {
  return v8::String::NewFromUtf8(v8::Isolate::GetCurrent(),
      value.data(), v8::String::kNormalString, value.size());
}

Factory<v8::String>::return_t
Factory<v8::String>::New(const uint8_t * value, int length) {
  return v8::String::NewFromOneByte(v8::Isolate::GetCurrent(), value,
        v8::String::kNormalString, length);
}

Factory<v8::String>::return_t
Factory<v8::String>::New(const uint16_t * value, int length) {
  return v8::String::NewFromTwoByte(v8::Isolate::GetCurrent(), value,
        v8::String::kNormalString, length);
}

Factory<v8::String>::return_t
Factory<v8::String>::New(v8::String::ExternalStringResource * value) {
  return v8::String::NewExternal(v8::Isolate::GetCurrent(), value);
}

Factory<v8::String>::return_t
#if NODE_MODULE_VERSION >= 42  // io.js v1.0.0
Factory<v8::String>::New(v8::String::ExternalOneByteStringResource * value) {
#else
Factory<v8::String>::New(v8::String::ExternalAsciiStringResource * value) {
#endif
  return v8::String::NewExternal(v8::Isolate::GetCurrent(), value);
}

//=== String Object ============================================================

Factory<v8::StringObject>::return_t
Factory<v8::StringObject>::New(v8::Handle<v8::String> value) {
  return v8::StringObject::New(value).As<v8::StringObject>();
}

//=== Unbound Script ===========================================================

Factory<v8::UnboundScript>::return_t
Factory<v8::UnboundScript>::New(v8::Local<v8::String> source) {
  v8::ScriptCompiler::Source src(source);
  return v8::ScriptCompiler::CompileUnbound(v8::Isolate::GetCurrent(), &src);
}

Factory<v8::UnboundScript>::return_t
Factory<v8::UnboundScript>::New( v8::Local<v8::String> source
                               , v8::ScriptOrigin const& origin) {
  v8::ScriptCompiler::Source src(source, origin);
  return v8::ScriptCompiler::CompileUnbound(v8::Isolate::GetCurrent(), &src);
}

}  // end of namespace NanIntern

//=== Presistents and Handles ==================================================

template <typename T>
v8::Local<T>
NanNew(v8::Handle<T> h) {
  return v8::Local<T>::New(v8::Isolate::GetCurrent(), h);
}

template <typename T>
v8::Local<T>
NanNew(v8::Persistent<T> const& p) {
  return v8::Local<T>::New(v8::Isolate::GetCurrent(), p);
}

#endif  // NAN_IMPLEMENTATION_12_INL_H_
