import { FC, PropsWithChildren, useState, useMemo, useEffect } from "react";
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

import useCommon from "@/hooks/useCommon";
import { MAX_TOKENS } from "@/lib/env";

interface Props extends PropsWithChildren {}

export enum FieldNames {
  Username = "username",
  GPTName = "gptname",
  Model = "model",
  Temperature = "temperature",
  MaxTokens = "maxTokens",
  FrequencyPenalty = "frequencyPenalty",
  PresencePenalty = "presencePenalty",
  EnableSystemPrompt = "enableSystemPrompt",
  Role = "role",
  GoodAt = "goodAt",
  Topics = "topics",
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

// https://platform.openai.com/docs/models/model-endpoint-compatibility
const modelOptions = [
  {
    label: "GPT 4 Turbo Preview(2023/04)",
    value: "gpt-4-turbo-preview",
  },
  {
    label: "GPT 4(2021/09)",
    value: "gpt-4",
  },
  {
    label: "GPT 3.5 Turbo(2021/09)",
    value: "gpt-3.5-turbo",
  },
];

const Settings: FC<Props> = () => {
  const [form] = Form.useForm();
  const watchMaxTokens = Form.useWatch(FieldNames.MaxTokens, form);
  const watchFrequencyPenalty = Form.useWatch(
    FieldNames.FrequencyPenalty,
    form
  );

  const { settings, computed, setSettings, toggleSetting } = useCommon();
  const [openPreviewModal, setPreviewModal] = useState(false);

  const initialValue = useMemo(
    () => ({
      [FieldNames.Username]: settings.username,
      [FieldNames.GPTName]: settings.gptname,
      [FieldNames.Model]: settings.model,
      [FieldNames.Temperature]: settings.temperature,
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

  useEffect(() => {
    if (watchMaxTokens > MAX_TOKENS) {
      form.setFieldValue(FieldNames.MaxTokens, MAX_TOKENS);
    }
    if (watchFrequencyPenalty < -2 || watchFrequencyPenalty > 2) {
      form.setFieldValue(FieldNames.FrequencyPenalty, 0);
    }
  }, [watchMaxTokens, watchFrequencyPenalty]);

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
        <Form.Item name={FieldNames.Model} label="ChatGPT Model">
          <Select options={modelOptions} />
        </Form.Item>

        <Form.Item name={FieldNames.Temperature} label="Temperature">
          <Select options={temperatureOptions} />
        </Form.Item>

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
