// GoogleLogin.js
"use client";

import React from 'react';

interface Props {
    onSuccess: Function;
    onFailure: Function
}

function GoogleLoginButton({ onSuccess, onFailure }: Props) {
  const handleGoogleLogin = () => {
    window.gapi.load('auth2', () => {
        window.gapi.auth2.init({
        client_id: '722381443189-4uc07bojimjdjbqng5al788k2nmdnclo.apps.googleusercontent.com',
      }).then((auth2: any) => {
        auth2.signIn()
          .then((googleUser: any) => {
            // 登录成功，可以获取用户信息
            const profile = googleUser.getBasicProfile();
            const idToken = googleUser.getAuthResponse().id_token;
            
            // 调用登录成功回调
            onSuccess(profile, idToken);
          })
          .catch((error: any) => {
            // 登录失败
            onFailure(error);
          });
      });
    });
  };

  return (
    <button onClick={handleGoogleLogin}>Continue With Google</button>
  );
}

export default GoogleLoginButton;
