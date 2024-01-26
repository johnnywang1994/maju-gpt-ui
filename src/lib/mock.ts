export const mockMessages = [{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1677858242,
  "model": "gpt-3.5-turbo-1106",
  "usage": {
      "prompt_tokens": 13,
      "completion_tokens": 7,
      "total_tokens": 20
  },
  "choices": [
      {
          "message": {
              "role": "assistant",
              "content": "\n\nThis is a test! This is a test! This is a test! This is a test!"
          },
          "logprobs": null,
          "finish_reason": "stop",
          "index": 0
      }
  ]
}, {
  "id": "chatcmpl-8kau1g1cfEK9VnPgPxU5OpjQKpNOC",
  "object": "chat.completion",
  "created": 1706115633,
  "model": "gpt-3.5-turbo-0613",
  "choices": [
      {
          "index": 0,
          "message": {
              "role": "assistant",
              "content": "以下是一個簡單的函數 curry 化的範例：\n\n```python\ndef add(x, y):\n    return x + y\n\ndef curry(func):\n    def curried(*args, **kwargs):\n        if len(args) + len(kwargs) >= func.__code__.co_argcount:\n            return func(*args, **kwargs)\n        return lambda *args2, **kwargs2: curried(*(args + args2), **(kwargs | kwargs2))\n    return curried\n\ncurried_add = curry(add)\nprint(curried_add(2)(3))  # 輸出 5\nprint(curried_add(2, 3))  # 輸出 5\n```\n\n在上面的例子中，`curry` 函數可以用來將任何具有多個參數的函數 curry 化。它透過遞迴的方式將函數的參數逐步綁定，直到收到足夠的參數呼叫原始函數。在每次呼叫中，我們都檢查所收到的參數數量是否足夠，如果足夠就直接呼叫原始函數，否則返回一個新的帶有部分參數的函數。這樣可以讓我們使用更簡潔的方式呼叫函數，例如 `curried_add(2)(3)` 或 `curried_add(2, 3)`。"
          },
          "logprobs": null,
          "finish_reason": "stop"
      }
  ],
  "usage": {
      "prompt_tokens": 29,
      "completion_tokens": 101,
      "total_tokens": 130
  },
  "system_fingerprint": null
}];