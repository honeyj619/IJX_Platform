<template>
  <v-container fluid class="h-100" style="padding: 0;">
    <v-row class="h-100" no-gutters>
      <v-col
        cols="12"
        lg="4"
        xl="3"
        class="d-flex flex-column"
      >
        <v-card class="rounded-0" elevation="0">
          <v-card-text class="pa-4">
            <v-text-field
              v-model="searchQuery"
              placeholder="搜索对话..."
              prepend-inner-icon="mdi-magnify"
              rounded="pill"
              density="compact"
              variant="outlined"
              single-line
            />
          </v-card-text>
        </v-card>

        <v-card class="flex-grow-1 overflow-y-auto" elevation="0">
          <v-list density="compact" class="py-0">
            <v-list-item
              v-for="message in messages"
              :key="message.id"
              :active="selectedMessage?.id === message.id"
              @click="selectMessage(message)"
              class="cursor-pointer"
              :ripple="true"
              :class="{'bg-primary-lighten-5': selectedMessage?.id === message.id}"
            >
              <template v-slot:prepend>
                <v-avatar size="48" :color="message.color">
                  <img :src="message.avatar" :alt="message.name" v-if="!message.initials" />
                  <span class="text-white font-weight-bold" v-else>{{ message.initials }}</span>
                </v-avatar>
              </template>
              <v-list-item-content>
                <v-list-item-title class="font-weight-medium">{{ message.name }}</v-list-item-title>
                <v-list-item-subtitle class="text-truncate">{{ message.message }}</v-list-item-subtitle>
              </v-list-item-content>
              <template v-slot:append>
                <div class="d-flex flex-column align-end">
                  <span class="text-xs text-medium-emphasis mb-1">{{ message.time }}</span>
                  <v-badge
                    v-if="message.unread"
                    color="primary"
                    :content="message.unread"
                  />
                </div>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col
        cols="12"
        lg="8"
        xl="9"
        class="d-flex flex-column"
      >
        <template v-if="selectedMessage">
          <v-card elevation="1" class="rounded-0">
            <v-toolbar flat>
              <v-avatar size="40" :color="selectedMessage.color">
                <img :src="selectedMessage.avatar" :alt="selectedMessage.name" v-if="!selectedMessage.initials" />
                <span class="text-white font-weight-bold" v-else>{{ selectedMessage.initials }}</span>
              </v-avatar>
              <v-toolbar-title class="ms-3">
                <div class="font-weight-medium">{{ selectedMessage.name }}</div>
                <div class="text-caption text-medium-emphasis">在线</div>
              </v-toolbar-title>
              <v-spacer />
              <v-btn icon color="primary">
                <v-icon>mdi-phone</v-icon>
              </v-btn>
              <v-btn icon color="primary">
                <v-icon>mdi-video</v-icon>
              </v-btn>
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn icon v-bind="props">
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list density="compact">
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon>mdi-account-details</v-icon>
                    </template>
                    <v-list-item-title>查看资料</v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon>mdi-star</v-icon>
                    </template>
                    <v-list-item-title>收藏</v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="error">mdi-delete</v-icon>
                    </template>
                    <v-list-item-title>删除对话</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-toolbar>
          </v-card>

          <v-card class="flex-grow-1 overflow-y-auto pa-6" elevation="0" color="grey-lighten-4">
            <div
              v-for="chat in selectedMessage.chatMessages"
              :key="chat.id"
              class="mb-4"
            >
              <div :class="{'d-flex justify-end': chat.sender === 'me', 'd-flex justify-start': chat.sender !== 'me'}">
                <v-card
                  max-width="70%"
                  :color="chat.sender === 'me' ? 'primary' : 'white'"
                  :class="{'shadow-4': chat.sender === 'me'}"
                  rounded="lg"
                >
                  <v-card-text class="pa-4">
                    <p :class="{'text-white': chat.sender === 'me'}">{{ chat.content }}</p>
                    <p class="text-xs mt-2 mb-0 text-right" :class="{'text-white/70': chat.sender === 'me', 'text-medium-emphasis': chat.sender !== 'me'}">
                      {{ chat.time }}
                      <v-icon v-if="chat.sender === 'me'" size="14" class="ml-1">mdi-check-all</v-icon>
                    </p>
                  </v-card-text>
                </v-card>
              </div>
            </div>
          </v-card>

          <v-card elevation="1" class="rounded-0">
            <v-toolbar flat class="pa-2">
              <v-btn icon>
                <v-icon>mdi-emoticon-happy-outline</v-icon>
              </v-btn>
              <v-btn icon>
                <v-icon>mdi-paperclip</v-icon>
              </v-btn>
              <v-text-field
                v-model="newMessage"
                placeholder="输入消息..."
                rounded="pill"
                variant="outlined"
                class="flex-grow-1 mx-2"
                density="compact"
                @keyup.enter="sendMessage"
              />
              <v-btn icon color="primary" @click="sendMessage">
                <v-icon>mdi-send</v-icon>
              </v-btn>
            </v-toolbar>
          </v-card>
        </template>

        <template v-else>
          <div class="flex-grow-1 d-flex align-center justify-center">
            <div class="text-center">
              <div class="mb-8">
                <v-icon size="160" color="primary-lighten-3">mdi-message-heart</v-icon>
              </div>
              <h1 class="text-h4 font-weight-bold mb-4">选择对话开始聊天</h1>
              <p class="text-h6 text-medium-emphasis mb-8">从左侧列表中选择一个对话开始交流</p>
              <v-btn
                color="primary"
                size="large"
                elevation="2"
                @click="showNewChatDialog = true"
              >
                <v-icon left>mdi-plus</v-icon>
                开始新对话
              </v-btn>
            </div>
          </div>
        </template>
      </v-col>
    </v-row>

    <v-dialog v-model="showNewChatDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5 font-weight-bold">新建对话</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newChatName"
            label="对方姓名"
            variant="outlined"
            class="mb-4"
          />
          <v-text-field
            v-model="newChatMessage"
            label="第一条消息"
            variant="outlined"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="showNewChatDialog = false">取消</v-btn>
          <v-btn color="primary" @click="createNewChat">创建</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
  initials?: string
  color: string
  message: string
  time: string
  unread?: number
  chatMessages?: ChatMessage[]
}

const searchQuery = ref('')
const selectedMessage = ref<Message | null>(null)
const newMessage = ref('')
const showNewChatDialog = ref(false)
const newChatName = ref('')
const newChatMessage = ref('')

const messages: Message[] = [
  {
    id: 1,
    name: '如意助手',
    avatar: '',
    initials: 'RY',
    color: 'primary',
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
    avatar: '',
    initials: '张',
    color: 'blue',
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
    name: '流程中心',
    avatar: '',
    initials: 'LC',
    color: 'purple',
    message: '信息管理部梁吉力提交的项目立项申请需要审批',
    time: '12:21',
    unread: 8,
  },
  {
    id: 4,
    name: '日程提醒',
    avatar: '',
    initials: 'RC',
    color: 'orange',
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
  selectedMessage.value.message = newMessage.value
  selectedMessage.value.time = newChatMessage.time
  newMessage.value = ''
  
  nextTick(() => {
    const chatContainer = document.querySelector('.flex-grow-1.overflow-y-auto')
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight
    }
  })
}

const createNewChat = () => {
  if (newChatName.value.trim()) {
    showNewChatDialog.value = false
    newChatName.value = ''
    newChatMessage.value = ''
  }
}
</script>
