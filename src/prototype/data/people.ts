export interface Person {
  id: string
  name: string
  avatar: string
  role: string
  department: string
}

// 本地中性头像（CSS data URI 首字母圆），替代远程 DiceBear；阶段四消息页接入正式本地头像
function initialAvatar(name: string): string {
  const ch = encodeURIComponent(name.slice(0, 1))
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" rx="40" fill="#fde7f0"/><text x="40" y="52" font-size="34" text-anchor="middle" fill="#c42e63" font-family="sans-serif">${ch}</text></svg>`
  )}`
}

export const currentUser: Person = {
  id: '1',
  name: '梁吉力',
  avatar: initialAvatar('梁'),
  role: '管理员',
  department: '信息中心'
}

export const peopleList: Person[] = [
  { id: '1', name: '梁吉力', avatar: initialAvatar('梁'), role: '管理员', department: '信息中心' },
  { id: '2', name: '王建国', avatar: initialAvatar('王'), role: '主管', department: '综合管理部' },
  { id: '3', name: '李娜', avatar: initialAvatar('李'), role: '职员', department: '财务部' },
  { id: '4', name: '张伟', avatar: initialAvatar('张'), role: '工程师', department: '信息中心' },
  { id: '5', name: '刘芳', avatar: initialAvatar('刘'), role: '专员', department: '人事部' },
  { id: '6', name: '陈明', avatar: initialAvatar('陈'), role: '经理', department: '业务部' },
  { id: '7', name: '赵丽', avatar: initialAvatar('赵'), role: '助理', department: '办公室' },
  { id: '8', name: '孙强', avatar: initialAvatar('孙'), role: '技术员', department: '信息中心' }
]

export function getPersonById(id: string): Person | undefined {
  return peopleList.find(p => p.id === id)
}

export function searchPeople(keyword: string): Person[] {
  return peopleList.filter(p =>
    p.name.includes(keyword) ||
    p.department.includes(keyword)
  )
}
