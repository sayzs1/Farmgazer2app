import { NextRequest, NextResponse } from "next/server";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import {
  AIMessage,
  BaseMessage,
  ChatMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { createDatabaseQueryTool } from "@/lib/langchain-tools";

// 将 Vercel 消息格式转换为 LangChain 消息格式
const convertVercelMessageToLangChainMessage = (message: any) => {
  if (message.role === "user") {
    return new HumanMessage(message.content);
  } else if (message.role === "assistant") {
    return new AIMessage(message.content);
  } else {
    return new ChatMessage(message.content, message.role);
  }
};

// 将 LangChain 消息格式转换为 Vercel 消息格式
const convertLangChainMessageToVercelMessage = (message: BaseMessage) => {
  if (message._getType() === "human") {
    return { content: message.content, role: "user" };
  } else if (message._getType() === "ai") {
    return {
      content: message.content,
      role: "assistant",
      tool_calls: (message as AIMessage).tool_calls,
    };
  } else {
    return { content: message.content, role: message._getType() };
  }
};

// Agent 系统提示模板
const AGENT_SYSTEM_TEMPLATE = 
`You are an intelligent assistant for an agricultural monitoring system. You can help farmers analyze crop health conditions and answer questions about farm data.

You have the following capabilities:
1. Answer agriculture-related questions from users
2. Query the farm monitoring database for information such as crop health status, temperature and humidity data, problem category statistics, etc.

Please adhere to the following principles:
1. Keep your answers professional, helpful, and provide valuable advice. All answers must be in English.
2. For questions involving real-time information, use the timestamp from the database.
3. Keep responses to 100 words or less.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // 过滤消息，只保留用户和助手消息
    const messages = (body.messages ?? [])
      .filter(
        (message: any) => message.role === "user" || message.role === "assistant",
      )
      .map(convertVercelMessageToLangChainMessage);

    // 构建工具集合，仅包含数据库查询工具
    const tools = [createDatabaseQueryTool()];
    
    // 初始化聊天模型
    const chat = new ChatOpenAI({
      model: "gpt-4o-mini",
      temperature: 0,
    });

    // 创建 ReAct 代理
    const agent = createReactAgent({
      llm: chat,
      tools,
      messageModifier: new SystemMessage(AGENT_SYSTEM_TEMPLATE),
    });

    // 调用代理并获取结果
    const result = await agent.invoke({ messages });

    // 返回格式化的结果
    return NextResponse.json(
      {
        status: 'success',
        data: {
          content: result.messages[result.messages.length - 1].content,
          role: "assistant"
        }
      },
      { status: 200 },
    );
  } catch (e: any) {
    console.error('Agent error:', e);
    return NextResponse.json({ 
      status: 'error',
      message: '处理请求时出错',
      error: e instanceof Error ? e.message : '未知错误'
    }, { status: 500 });
  }
} 