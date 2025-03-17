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

// Agent 系统提示模板
const AGENT_SYSTEM_TEMPLATE = `You are an intelligent farming assistant for an agricultural monitoring system. You help farmers analyze crop health conditions and answer questions about their farm data.

You have the following capabilities:
1. Query the farm monitoring database to get information such as crop health status, temperature and humidity data, problem category statistics, etc.

Your responses should be professional, helpful, and provide valuable advice. All responses should be in English, as your users speak English.`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages) {
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 }
      );
    }

    // 过滤消息，只保留用户和助手消息
    const filteredMessages = messages
      .filter(
        (message: any) => message.role === "user" || message.role === "assistant",
      )
      .map(convertVercelMessageToLangChainMessage);

    // 构建工具集合，仅包含数据库查询工具
    const tools = [createDatabaseQueryTool()];
    
    // 初始化聊天模型
    const chat = new ChatOpenAI({
      model: "gpt-4o-mini", // 或者改回 "gpt-3.5-turbo" 来匹配原始设置
      temperature: 0.7,     // 保持与原始设置相同
    });

    // 创建 ReAct 代理
    const agent = createReactAgent({
      llm: chat,
      tools,
      messageModifier: new SystemMessage(AGENT_SYSTEM_TEMPLATE),
    });

    // 调用代理并获取结果
    const result = await agent.invoke({ messages: filteredMessages });

    // 从结果中获取最后一条消息
    const lastMessage = result.messages[result.messages.length - 1];
    
    // 返回格式化的响应，与原始 chat/route.ts 格式相匹配
    return NextResponse.json({
      status: 'success',
      data: {
        content: lastMessage.content,
        role: "assistant"
      }
    });

  } catch (error) {
    console.error('Agent error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to get response from AI',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 