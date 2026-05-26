<template>
  <v-container fluid class="h-full">
    <v-row class="h-full">
      <v-col
        cols="12"
        lg="4"
        class="bg-gray-50 border-r border-gray-200 flex flex-col"
      >
        <div class="p-4 border-b border-gray-200">
          <v-text-field
            v-model="searchQuery"
            placeholder="搜索..."
            prepend-icon="mdi-magnify"
            rounded-full
            density="compact"
            class="bg-white"
          />
        </div>

        <v-list class="flex-1 overflow-y-auto">
          <v-list-item
            v-for="message in messages"
            :key="message.id"
            :active="selectedMessage?.id === message.id"
            @click="selectMessage(message)"
            class="cursor-pointer"
          >
            <template v-slot:prepend>
              <v-avatar size="40">
                <img :src="message.avatar" :alt="message.name" />
              </v-avatar>
            </template>
            <v-list-item-title class="font-medium">{{ message.name }}</v-list-item-title>
            <v-list-item-subtitle class="text-sm text-gray-500 truncate">{{ message.message }}</v-list-item-subtitle>
            <template v-slot:append>
              <div class="text-right">
                <span class="text-xs text-gray-400">{{ message.time }}</span>
                <v-badge
                  v-if="message.unread"
                  color="pink"
                  :content="message.unread"
                  class="ml-2"
                />
              </div>
            </template>
          </v-list-item>
        </v-list>
      </v-col>

      <v-col
        cols="12"
        lg="8"
        class="bg-white flex flex-col"
      >
        <template v-if="selectedMessage">
          <v-toolbar class="border-b border-gray-200">
            <v-avatar size="40">
              <img :src="selectedMessage.avatar" :alt="selectedMessage.name" />
            </v-avatar>
            <v-toolbar-title class="ml-3">{{ selectedMessage.name }}</v-toolbar-title>
            <v-spacer />
            <v-btn icon>
              <v-icon>mdi-phone</v-icon>
            </v-btn>
            <v-btn icon>
              <v-icon>mdi-video</v-icon>
            </v-btn>
            <v-btn icon>
              <v-icon>mdi-more-vertical</v-icon>
            </v-btn>
          </v-toolbar>

          <div class="flex-1 overflow-y-auto p-4 space-y-4" ref="contentRef">
            <v-card
              v-for="chat in selectedMessage.chatMessages"
              :key="chat.id"
              :class="chat.sender === 'me' ? 'ml-auto' : 'mr-auto'"
              max-width="80%"
              :color="chat.sender === 'me' ? 'pink lighten-4' : 'gray-lighten-1'"
              rounded="lg"
            >
              <v-card-text class="p-4">
                <p>{{ chat.content }}</p>
                <span class="text-xs text-gray-400 ml-auto d-block mt-2">{{ chat.time }}</span>
              </v-card-text>
            </v-card>
          </div>

          <v-toolbar class="border-t border-gray-200">
            <v-btn icon>
              <v-icon>mdi-face</v-icon>
            </v-btn>
            <v-text-field
              v-model="newMessage"
              placeholder="输入消息..."
              rounded-full
              @keyup.enter="sendMessage"
            />
            <v-btn icon color="pink" @click="sendMessage">
              <v-icon>mdi-send</v-icon>
            </v-btn>
          </v-toolbar>
        </template>

        <template v-else>
          <div class="flex-1 flex items-center justify-center">
            <div class="text-center">
              <div class="mb-6">
                <v-icon size="128" color="pink lighten-3">mdi-message-circle</v-icon>
              </div>
              <h2 class="text-2xl font-bold text-gray-800 mb-2">选择一个对话开始聊天</h2>
              <p class="text-gray-500">从左侧列表中选择一个消息对话</p>
            </div>
          </div>
        </template>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'

interface ChatMessage {
  id: number
  sender: 'me' | 'other'
  type: string
  content: string
  time: string
}

interface Message {
  id: number
  name: string
  avatar: string
  message: string
  time: string
  unread?: number
  chatMessages?: ChatMessage[]
}

const searchQuery = ref('')
const selectedMessage = ref<Message | null>(null)
const newMessage = ref('')
const contentRef = ref<HTMLElement | null>(null)

const messages: Message[] = [
  {
    id: 1,
    name: '如意助手',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=如意&backgroundColor=ec4899',
    message: '您好！我是如意助手，请问有什么可以帮您？',
    time: '12:21',
    unread: 2,
    chatMessages: [
      { id: 1, sender: 'me', type: 'text', content: '你好，我想了解一下上个月的考勤统计', time: '今天 10:30' },
      { id: 2, sender: 'other', type: 'text', content: '您好！已为您查询到上个月考勤统计：应出勤22天，实际出勤21天，迟到2次，早退0次。请假1天（年假）。总体出勤率95.5%，表现良好！', time: '今天 10:31' },
      { id: 3, sender: 'me', type: 'text', content: '好的，顺便问一下，项目立项申请流程是什么？', time: '今天 10:33' },
      { id: 4, sender: 'other', type: 'text', content: '项目立项申请流程如下：填写项目基本信息、提交项目预算申请、部门负责人审批、项目立项完成。', time: '今天 10:33' },
    ],
  },
  {
    id: 2,
    name: '张飞',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=张飞&backgroundColor=3b82f6',
    message: '已经和相关部门沟通过我们的诉求',
    time: '昨天 16:21',
    chatMessages: [
      { id: 1, sender: 'other', type: 'text', content: '梁工，项目最新进展如何？', time: '昨天 15:30' },
      { id: 2, sender: 'me', type: 'text', content: '张工，智能办公系统升级项目现在到什么阶段了？', time: '昨天 15:35' },
      { id: 3, sender: 'other', type: 'text', content: '已经和相关部门沟通过我们的诉求，他们表示会尽快落实。', time: '昨天 16:21' },
    ],
  },
  {
    id: 3,
    name: '流程',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=流程&backgroundColor=8b5cf6',
    message: '信息管理部梁吉力提交的项目立项申请需要审批',
    time: '12:21',
    unread: 8,
  },
  {
    id: 4,
    name: '日程',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=日程&backgroundColor=f97316',
    message: '今日有2个日程安排，明日有1个日程安排',
    time: '12:00',
    unread: 1,
  },
]

const selectMessage = (message: Message) => {
  selectedMessage.value = message
  nextTick(() => {
    if (contentRef.value) {
      contentRef.value.scrollTop = contentRef.value.scrollHeight
    }
  })
}

const sendMessage = () => {
  if (!newMessage.value.trim() || !selectedMessage.value?.chatMessages) return
  
  const newChatMessage: ChatMessage = {
    id: Date.now(),
    sender: 'me',
    type: 'text',
    content: newMessage.value,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
  }
  
  selectedMessage.value.chatMessages.push(newChatMessage)
  newMessage.value = ''
  
  nextTick(() => {
    if (contentRef.value) {
      contentRef.value.scrollTop = contentRef.value.scrollHeight
    }
  })
}
</script>
