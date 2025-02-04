import { FC, PropsWithChildren, useState, useMemo, useEffect, use } from "react";
import {
  Space,
  Form,
  Switch,
  Input,
  Button,
  Select,
  Modal,
  message,
} from "antd";
import { Icon } from "@iconify/react";

import useCommon, { DefaultModel, ModelProvider, PageTab, localSettingKey } from "@/hooks/useCommon";
import useUpdate from '@/hooks/useUpdate';
import usePrevious from "@/hooks/usePrevious";
import { MAX_TOKENS, MODE } from "@/lib/env";

const isStatic = MODE === "static";

interface Props extends PropsWithChildren {}

export enum FieldNames {
  Username = "username",
  GPTName = "gptname",
  Provider = "provider",
  Model = "model",
  Temperature = "temperature",
  Size = 'size', // for image generation
  MaxTokens = "maxTokens",
  FrequencyPenalty = "frequencyPenalty",
  PresencePenalty = "presencePenalty",
  EnableSystemPrompt = "enableSystemPrompt",
  Role = "role",
  GoodAt = "goodAt",
  Topics = "topics",
  ApiKey = "apiKey",
}

const temperatureOptions = [
  {
    label: "Authority(0.1)",
    value: 0.1,
  },
  {
    label: "Expert(0.3)",
    value: 0.3,
  },
  {
    label: "Normal(0.5)",
    value: 0.5,
  },
  {
    label: "Creator(0.7)",
    value: 0.7,
  },
  {
    label: "Dreamer(1)",
    value: 1,
  },
];

const chatModelProviderOptions = [
  {
    label: 'OpenAI',
    value: ModelProvider.OpenAI
  },
  {
    label: 'DeepSeek',
    value: ModelProvider.DeepSeek
  },
  {
    label: 'Gemini',
    value: ModelProvider.Gemini
  }
];

const chatModelOptions = {
  // https://platform.openai.com/docs/models/model-endpoint-compatibility
  [ModelProvider.OpenAI]: [
    {
      label: "GPT-4o",
      value: "gpt-4o",
    },
    {
      label: "GPT-4o mini",
      value: "gpt-4o-mini",
    },
    {
      label: "o1",
      value: "o1",
    },
    {
      label: "o1 mini",
      value: "o1-mini",
    },
    {
      label: "GPT 4 Turbo(2024/04)",
      value: "gpt-4-turbo",
    },
    {
      label: "GPT 4(2021/09)",
      value: "gpt-4",
    },
    {
      label: "GPT 3.5 Turbo(2021/09)",
      value: "gpt-3.5-turbo",
    },
  ],
  // https://api-docs.deepseek.com/zh-cn/
  [ModelProvider.DeepSeek]: [
    {
      label: "DeepSeek Chat",
      value: "deepseek-chat",
    },
    {
      label: "DeepSeek R1",
      value: "deepseek-reasoner",
    },
  ],
  // https://ai.google.dev/gemini-api/docs/models/gemini?hl=zh-tw
  [ModelProvider.Gemini]: [
    {
      label: "Gemini 1.5 Flash",
      value: "gemini-1.5-flash",
    },
    {
      label: "Gemini 1.5 Flash 8B(small task)",
      value: "gemini-1.5-flash-8b",
    },
  ],
}

const imageModelOptions = [
  {
    label: "DALL·E 3",
    value: "dall-e-3",
  },
  {
    label: "DALL·E 2",
    value: "dall-e-2",
  }
];

const dall2SizeOptions = ['256x256', '512x512', '1024x1024'];
const dall3SizeOptions = ['1024x1024', '1792x1024', '1024x1792'];

const Settings: FC<Props> = () => {
  const [form] = Form.useForm();
  const watchProvider: ModelProvider = Form.useWatch(FieldNames.Provider, form);
  const watchModel = Form.useWatch(FieldNames.Model, form);
  const watchMaxTokens = Form.useWatch(FieldNames.MaxTokens, form);
  const watchFrequencyPenalty = Form.useWatch(
    FieldNames.FrequencyPenalty,
    form
  );
  const watchPresencePenalty = Form.useWatch(
    FieldNames.PresencePenalty,
    form
  );

  const { settings, pageTab, computed, setSettings, toggleSetting } = useCommon();
  const prevPageTab = usePrevious(pageTab, (prev, curr) => prev === curr);
  const [openPreviewModal, setPreviewModal] = useState(false);

  const modelOptions = pageTab === PageTab.Chat ? chatModelOptions[watchProvider] : imageModelOptions;

  const sizeOptions = (watchModel === 'dall-e-3' ? dall3SizeOptions : dall2SizeOptions).map((v) => ({ label: v, value: v }));

  const initialValue = useMemo(
    () => ({
      [FieldNames.Username]: settings.username,
      [FieldNames.GPTName]: settings.gptname,
      [FieldNames.Provider]: settings.provider,
      [FieldNames.Model]: settings.model,
      [FieldNames.Temperature]: settings.temperature,
      [FieldNames.Size]: settings.size,
      [FieldNames.MaxTokens]: settings.maxTokens,
      [FieldNames.FrequencyPenalty]: settings.frequencyPenalty,
      [FieldNames.PresencePenalty]: settings.presencePenalty,
      [FieldNames.EnableSystemPrompt]: settings.enableSystemPrompt,
      [FieldNames.Role]: settings.role,
      [FieldNames.GoodAt]: settings.goodAt,
      [FieldNames.Topics]: settings.topics,
    }),
    [settings]
  );

  const handleSubmit = (values: Record<FieldNames, any>) => {
    values.maxTokens = Number(values.maxTokens);
    values.frequencyPenalty = Number(values.frequencyPenalty);
    values.presencePenalty = Number(values.presencePenalty);
    setSettings(values);
    toggleSetting(false);
    message.success("New settings applied");
  };

  // reset invalid value
  useEffect(() => {
    if (watchMaxTokens > MAX_TOKENS) {
      form.setFieldValue(FieldNames.MaxTokens, MAX_TOKENS);
    }
    if (watchFrequencyPenalty < -2 || watchFrequencyPenalty > 2) {
      form.setFieldValue(FieldNames.FrequencyPenalty, 0);
    }
    if (watchPresencePenalty < -2 || watchPresencePenalty > 2) {
      form.setFieldValue(FieldNames.PresencePenalty, 0);
    }
  }, [form, watchMaxTokens, watchFrequencyPenalty, watchPresencePenalty]);

  // reset model value when changing provider
  useUpdate(() => {
    switch (watchProvider) {
      case ModelProvider.OpenAI:
        form.setFieldValue(FieldNames.Model, DefaultModel.Chat);
        break;
      case ModelProvider.DeepSeek:
        form.setFieldValue(FieldNames.Model, DefaultModel.DeepSeekChat);
        break;
      case ModelProvider.Gemini:
        form.setFieldValue(FieldNames.Model, DefaultModel.GeminiChat);
        break;
      default:
        break;
    }
  }, [watchProvider]);

  // reset form model value when changing pageTab
  useUpdate(() => {
    // pageTab update will be mistakenly triggered by other state change
    // so we need to check if it's really changed here
    if (prevPageTab === pageTab) return;
    switch (pageTab) {
      case PageTab.Chat:
        const values = {
          [FieldNames.Provider]: ModelProvider.OpenAI,
          [FieldNames.Model]: DefaultModel.Chat,
        };
        form.setFieldsValue(values);
        setSettings(values);
        break;
      case PageTab.Image:
        // OpenAI support Image tab
        if (settings.provider !== ModelProvider.OpenAI) {
          const values = {
            [FieldNames.Provider]: ModelProvider.OpenAI,
            [FieldNames.Model]: DefaultModel.Image,
          };
          form.setFieldsValue(values);
          setSettings(values);
          break;
        }
        break;
      default:
        break;
    }
  }, [form, prevPageTab, pageTab]);

  // init settings by local cache
  useEffect(() => {
    const prevSettingsRaw = localStorage.getItem(localSettingKey);
    if (!!prevSettingsRaw) {
      const prevSettings = JSON.parse(prevSettingsRaw);
      try {
        setSettings(prevSettings);
        form.setFieldsValue(prevSettings);
      } catch {}
    }
  }, [setSettings]);

  return (
    <div className="text-white">
      <Form
        layout="vertical"
        form={form}
        initialValues={initialValue}
        onFinish={handleSubmit}
      >
        <Space>
          <Button type="primary" htmlType="submit">
            Save
          </Button>
          <Button
            type="dashed"
            icon={
              <Icon width={20} icon="mdi:file-find" className="align-middle" />
            }
            onClick={() => setPreviewModal(true)}
          >
            Preview System Prompt
          </Button>
        </Space>
        <p className="text-red-500 text-xs">
          *remember to save for applying new settings
        </p>

        <h3 className="mb-4">User</h3>
        <Form.Item name={FieldNames.Username} label="Username">
          <Input placeholder="What's your name?" />
        </Form.Item>

        <Form.Item name={FieldNames.GPTName} label="AI name">
          <Input placeholder="What AI name you like?" />
        </Form.Item>

        <h3 className="mb-4">API</h3>
        {isStatic && (
          <Form.Item name={FieldNames.ApiKey} label="API key">
            <Input placeholder="Please enter your API key" autoComplete="off" />
          </Form.Item>
        )}

        <Form.Item name={FieldNames.Provider} label="Provider">
          <Select options={chatModelProviderOptions} />
        </Form.Item>

        <Form.Item name={FieldNames.Model} label="Model">
          <Select options={modelOptions} />
        </Form.Item>

        {pageTab === PageTab.Chat ? (
          <Form.Item name={FieldNames.Temperature} label="Temperature">
            <Select options={temperatureOptions} />
          </Form.Item>
        ) : (
          <Form.Item name={FieldNames.Size} label="Image Size">
            <Select options={sizeOptions} />
          </Form.Item>
        )}

        <Form.Item
          name={FieldNames.MaxTokens}
          label={`Max Tokens(<${MAX_TOKENS})`}
        >
          <Input type="number" min={0} max={MAX_TOKENS} />
        </Form.Item>

        <Form.Item
          name={FieldNames.FrequencyPenalty}
          label="Frequency Penalty(-2 < v < 2)"
        >
          <Input type="number" min={-2} max={2} step={0.1} />
        </Form.Item>

        <Form.Item
          name={FieldNames.PresencePenalty}
          label="Presence Penalty(-2 < v < 2)"
        >
          <Input type="number" min={-2} max={2} step={0.1} />
        </Form.Item>

        <h3 className="mb-4">System Prompt</h3>
        <Form.Item
          name={FieldNames.EnableSystemPrompt}
          label=""
          className="mb-0"
        >
          <Switch checkedChildren="Enabled" unCheckedChildren="Closed" />
        </Form.Item>
        <p className="text-xs">
          *System Prompt will help you ask question with more focused and
          accurate result, but cost more tokens(fee).
        </p>

        <Form.Item name={FieldNames.Role} label="Role">
          <Input placeholder="I am a professional ..." />
        </Form.Item>

        <Form.Item name={FieldNames.GoodAt} label="Good At">
          <Input.TextArea rows={3} placeholder="I am good at ..." />
        </Form.Item>

        <Form.Item name={FieldNames.Topics} label="Topics">
          <Input.TextArea rows={3} placeholder="Question domain" />
        </Form.Item>
      </Form>

      <Modal
        title="System Prompt Preview"
        open={openPreviewModal}
        onOk={() => setPreviewModal(false)}
        onCancel={() => setPreviewModal(false)}
      >
        <p className="text-red-500 text-xs">
          *System Prompt will placed at the top of all messages
        </p>
        <div>{computed.systemPrompt}</div>
      </Modal>
    </div>
  );
};

export default Settings;
