#version 300 es
precision highp float;
in vec3 position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;
out vec3 vWorld;
out vec4 vShadow;
uniform mat4 shadowProjectionMatrix;
uniform mat4 shadowViewMatrix;
void main() {
  vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
  vShadow = shadowProjectionMatrix * shadowViewMatrix * vec4(vWorld, 1.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
