<template>
  <v-container fluid class="h-100 pa-0">
    <v-row class="h-100" no-gutters>
      <!-- 消息列表侧边栏 -->
      <v-col
        cols="12"
        lg="4"
        class="d-flex flex-column"
        style="border-right: 1px solid rgba(0, 0, 0, 0.08);"
      >
        <!-- 搜索栏 -->
        <div class="pa-4" style="border-bottom: 1px solid rgba(0, 0, 0, 0.08);">
          <v-text-field
            v-model="searchQuery"
            placeholder="搜索消息..."
            prepend-inner-icon="mdi-magnify"
            rounded="pill"
            density="compact"
            variant="outlined"
            single-line
            hide-details
          />
        </div>

        <!-- 消息列表 -->
        <div class="flex-grow-1 overflow-y-auto">
          <v-list density="comfortable" class="py-0">
            <v-list-item
              v-for="message in messages"
              :key="message.id"
              :active="selectedMessage?.id === message.id"
              @click="selectMessage(message)"
              class="cursor-pointer"
              :ripple="false"
              :class="{ 'bg-primary-lighten-5': selectedMessage?.id === message.id }"
              link
            >
              <template v-slot:prepend>
                <v-avatar size="48">
                  <v-img :src="message.avatar" :alt="message.name" />
                </v-avatar>
              </template>
              
              <v-list-item-content>
                <v-list-item-title class="font-weight-medium">
                  {{ message.name }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-truncate">
                  {{ message.message }}
                </v-list-item-subtitle>
              </v-list-item-content>
              
              <template v-slot:append>
                <div class="d-flex flex-column align-end">
                  <span class="text-caption text-medium-emphasis mb-1">{{ message.time }}</span>
                  <v-badge
                    v-if="message.unread"
                    color="primary"
                    :content="message.unread"
                    inline
                  />
                </div>
              </template>
            </v-list-item>
          </v-list>
        </div>
      </v-col>

      <!-- 聊天内容区 -->
      <v-col
        cols="12"
        lg="8"
        class="d-flex flex-column bg-grey-lighten-5"
      >
        <template v-if="selectedMessage">
          <!-- 聊天头部 -->
          <div class="pa-4 bg-white" style="border-bottom: 1px solid rgba(0, 0, 0, 0.08);">
            <v-row align="center" no-gutters>
              <v-avatar size="44">
                <v-img :src="selectedMessage.avatar" :alt="selectedMessage.name" />
              </v-avatar>
              <div class="ml-3">
                <div class="font-weight-medium text-body-1">{{ selectedMessage.name }}</div>
              </div>
              <v-spacer />
              <v-btn icon variant="text">
                <v-icon>mdi-phone-outline</v-icon>
              </v-btn>
              <v-btn icon variant="text">
                <v-icon>mdi-video-outline</v-icon>
              </v-btn>
              <v-btn icon variant="text">
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </v-row>
          </div>

          <!-- 聊天消息 -->
          <div class="flex-grow-1 overflow-y-auto pa-6">
            <div
              v-for="chat in selectedMessage.chatMessages"
              :key="chat.id"
              class="mb-5"
            >
              <div :class="chat.sender === 'me' ? 'd-flex justify-end' : 'd-flex justify-start'">
                <v-sheet
                  max-width="70%"
                  :color="chat.sender === 'me' ? 'primary-lighten-4' : 'white'"
                  rounded="lg"
                  elevation="0"
                  class="pa-4"
                >
                  <p class="ma-0 text-body-1">{{ chat.content }}</p>
                  <p class="ma-0 text-right mt-2 text-caption text-medium-emphasis">{{ chat.time }}</p>
                </v-sheet>
              </div>
            </div>
          </div>

          <!-- 输入栏 -->
          <div class="pa-4 bg-white" style="border-top: 1px solid rgba(0, 0, 0, 0.08);">
            <v-row align="center" no-gutters>
              <v-btn icon variant="text">
                <v-icon>mdi-emoticon-outline</v-icon>
              </v-btn>
              <v-btn icon variant="text">
                <v-icon>mdi-paperclip</v-icon>
              </v-btn>
              <v-col class="mx-3">
                <v-text-field
                  v-model="newMessage"
                  placeholder="输入消息..."
                  rounded="pill"
                  variant="outlined"
                  density="compact"
                  single-line
                  hide-details
                  @keyup.enter="sendMessage"
                />
              </v-col>
              <v-btn
                icon
                color="primary"
                @click="sendMessage"
                :disabled="!newMessage.trim()"
              >
                <v-icon>mdi-send</v-icon>
              </v-btn>
            </v-row>
          </div>
        </template>

        <!-- 空状态 -->
        <template v-else>
          <div class="flex-grow-1 d-flex align-center justify-center">
            <div class="text-center">
              <v-icon size="120" color="primary-lighten-3" class="mb-6">
                mdi-message-outline
              </v-icon>
              <h2 class="text-h5 font-weight-bold mb-2">选择一个对话开始聊天</h2>
              <p class="text-medium-emphasis mb-0">从左侧列表中选择一个消息对话</p>
            </div>
          </div>
        </template>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'

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
}
</script>
