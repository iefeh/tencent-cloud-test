// GoogleLogin.js
"use client";
import React, { useEffect } from 'react';

interface Props {
  onSuccess: Function;
  onFailure: Function
}

function GoogleLoginButton({ onSuccess, onFailure }: Props) {

  const handleCredentialResponse = (response: any) => {
    console.log("Encoded JWT ID token: " + response);
  }

  useEffect(() => {
    window.google.accounts.id.initialize({
      client_id: "722381443189-4uc07bojimjdjbqng5al788k2nmdnclo.apps.googleusercontent.com",
      callback: handleCredentialResponse
    });
    window.google.accounts.id.renderButton(
      document.getElementById("googlelogin"),
      { theme: "filled_black", size: "large", shape: 'circle', text: 'continue_with' }  // customization attributes
    );
    window.google.accounts.id.prompt(); // also display the One Tap dialog
  }, [])

  return (
    <div id="googlelogin"  >
    </div>
  );
}

export default GoogleLoginButton;
