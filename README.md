# Maju GPT UI

This is a simple UI for ChatGPT, integrated with LIFF login if you want. Chat data are stored in browser localStorage.


## Getting Started
1. create an env file
```bash
# server side
OPENAI_API_KEY=[your own openai api key]
LINE_CHANNEL_ID= #optional if enable liff auth

# client side
NEXT_PUBLIC_ENABLE_AUTH=false #optional
NEXT_PUBLIC_LIFF_ID=xxxx #optional if enable liff auth
NEXT_PUBLIC_OPENAI_OPTION_MAX_TOKENS=1024 #optional
NEXT_PUBLIC_OPENAI_MAX_MESSAGES=8 #optional
```

2. run the development server:

```bash
$ npm install
$ npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## Line Auth
If you want to auth for user from your channel, just adjust env and you're ready to go!