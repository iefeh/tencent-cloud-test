"use client";
import React, { useEffect } from 'react';

const TwitterLoginButton = () => {
  useEffect(() => {

    // console.log("%c Line:7 🍿", "color:#42b983", window.twttr);
    // window.twttr.widgets.createTweet(
    //   'TwitterDev',
    //   document.getElementById('twlogin'),
    //   {
    //     size: 'large'
    //   }
    // );
  }, [])
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
    <button id='twlogin' onClick={handleTwitterLogin} >Continue With Twitter</button>
  );
};

export default TwitterLoginButton;
