"use client";
import React from 'react';

const TwitterLoginButton = () => {
  const handleTwitterLogin = async () => {
    try {
      const response = await fetch('/api/twitter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ origin: location.href }),
      });

      if (response.ok) {
        // 用户将被重定向到Twitter登录页面
      } else {
        const errorData = await response.json();
        console.error('Twitter login error:', errorData.error);
      }
    } catch (error) {
      console.error('Twitter login error:', error);
    }
  };

  return (
    <button onClick={handleTwitterLogin}>Continue With Twitter</button>
  );
};

export default TwitterLoginButton;
