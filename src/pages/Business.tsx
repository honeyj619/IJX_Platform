import { useState, useRef, useEffect } from "react";
import { Search, Hexagon, ArrowRight, Plus, X, User, Upload, Star } from "lucide-react";
interface System {
  id: number;
  name: string;
  category: string;
  description: string;
  icon: string;
  color: string;
  iconUrl?: string;
  url?: string;
  visibility?: string;
  owner?: string;
  ownerName?: string;
}

const categoryGroups = [
  { name: "人力系统", id: "hr", color: "from-blue-600 to-blue-400", count: 9 },
  { name: "综合系统", id: "office", color: "from-violet-600 to-purple-400", count: 2 },
  { name: "运行系统", id: "ops", color: "from-emerald-600 to-teal-400", count: 14 },
  { name: "财务系统", id: "finance", color: "from-amber-500 to-orange-400", count: 1 },
];

const systems: System[] = [
  { id: 1, name: "人力资源E-HR系统", category: "hr", description: "人力资源管理系统，支持员工信息管理、考勤、薪资等功能", icon: "users", color: "bg-blue-500" },
  { id: 2, name: "Office", category: "hr", description: "办公自动化系统，支持日常办公流程管理", icon: "briefcase", color: "bg-indigo-500" },
  { id: 3, name: "梧桐云学堂", category: "hr", description: "企业在线学习平台，提供丰富的课程资源", icon: "graduation-cap", color: "bg-violet-500" },
  { id: 4, name: "绩效系统", category: "hr", description: "员工绩效考核管理系统", icon: "award", color: "bg-purple-500" },
  { id: 5, name: "绩效系统南京分公司", category: "hr", description: "南京分公司绩效专项管理系统", icon: "building", color: "bg-pink-500" },
  { id: 6, name: "绩效系统航服子公司", category: "hr", description: "航服子公司绩效专项管理系统", icon: "plane", color: "bg-rose-500" },
  { id: 7, name: "OA", category: "office", description: "办公自动化系统", icon: "folder-open", color: "bg-purple-500" },
  { id: 8, name: "SMS系统", category: "ops", description: "短信服务管理系统", icon: "message-square", color: "bg-emerald-500" },
  { id: 9, name: "网上准备", category: "ops", description: "网上准备工作管理系统", icon: "check-circle", color: "bg-teal-500" },
  { id: 10, name: "航班动态", category: "ops", description: "航班实时动态查询系统", icon: "plane-departure", color: "bg-cyan-500" },
  { id: 11, name: "机务维修", category: "ops", description: "机务维修管理系统", icon: "wrench", color: "bg-green-500" },
  { id: 12, name: "燃油监控系统", category: "ops", description: "燃油消耗监控与管理系统", icon: "fuel", color: "bg-lime-500" },
  { id: 13, name: "维修手册系统", category: "ops", description: "维修手册查阅与管理系统", icon: "book-open", color: "bg-emerald-600" },
  { id: 14, name: "法定自查", category: "ops", description: "法定自查管理系统", icon: "file-check", color: "bg-teal-600" },
  { id: 15, name: "运行网", category: "ops", description: "运行网络管理系统", icon: "network", color: "bg-green-600" },
  { id: 16, name: "考评系统", category: "hr", description: "员工考评管理系统", icon: "clipboard-list", color: "bg-violet-600" },
  { id: 17, name: "内推系统", category: "hr", description: "内部推荐管理系统", icon: "user-plus", color: "bg-indigo-600" },
  { id: 18, name: "e吉祥管理后台", category: "ops", description: "吉祥航空管理后台系统", icon: "settings", color: "bg-cyan-600" },
  { id: 19, name: "人力数字平台管理系统", category: "hr", description: "人力资源数字化管理平台", icon: "database", color: "bg-blue-600" },
  { id: 20, name: "BIP系统", category: "finance", description: "财务综合管理平台", icon: "dollar-sign", color: "bg-amber-500" },
  { id: 21, name: "运行风控系统", category: "ops", description: "运行风险控制管理系统", icon: "shield", color: "bg-emerald-700" },
  { id: 22, name: "PLM系统", category: "ops", description: "产品生命周期管理系统", icon: "layers", color: "bg-teal-700" },
  { id: 23, name: "航空安保管理系统", category: "ops", description: "航空安全保卫管理系统", icon: "shield-check", color: "bg-green-700" },
];

const mockContacts = [
  { id: "1", name: "张伟", department: "信息管理部", position: "系统管理员" },
  { id: "2", name: "李娜", department: "人力资源部", position: "HR经理" },
  { id: "3", name: "王强", department: "财务部", position: "财务总监" },
  { id: "4", name: "刘洋", department: "运行部", position: "运行经理" },
  { id: "5", name: "陈静", department: "综合管理部", position: "综合管理员" },
];

const iconMap: Record<string, JSX.Element> = {
  "users": <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
  "briefcase": <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>,
  "graduation-cap": <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M12 3v18M6 10l6-3 6 3M2 16l10-5 10 5"></path></svg>,
  "award": <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"></circle><path d="M15.47 12.89 17 21H7l1.53-8.11"></path><path d="m9.7 15.8 2.3-2.3 2.3 2.3"></path></svg>,
  "building": <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>,
  "plane": <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L8 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.8 2.8c.3.2.8.3 1.3.1l.5-.3c.4-.2.6-.6.5-1.1z"></path></svg>,
  "folder-open": <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"></path></svg>,
  "message-square": <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
  "check-circle": <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
  "plane-departure": <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L8 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.8 2.8c.3.2.8.3 1.3.1l.5-.3c.4-.2.6-.6.5-1.1z"></path><path d="M15 10l5-3-5-3"></path></svg>,
  "wrench": <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 0-7.94 0z"></path><path d="M17.6 8.4a1 1 0 0 0-1.4 0l-1.6-1.6a1 1 0 0 0-1.4 0l-2.3 2.3a1 1 0 0 0 0 1.4l6.6 6.6a1 1 0 0 0 1.4 0l2.3-2.3a1 1 0 0 0 0-1.4z"></path><path d="M21 16a9 9 0 0 1-9 9 9 9 0 0 1-6-2.3L3 13"></path></svg>,
  "fuel": <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 22V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v14"></path><path d="M14 10h3a1 1 0 0 0 0-2h-3V5a1 1 0 0 0-2 0v3h-3"></path><path d="M5 17h8"></path><path d="M5 21h8"></path></svg>,
  "book-open": <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>,
  "file-check": <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="m9 15 2 2 4-4"></path></svg>,
  "network": <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle><path d="m12 2 1.5 1.5"></path><path d="m12 20 1.5-1.5"></path><path d="m7.5 7.5 1.5 1.5"></path><path d="m16.5 16.5 1.5 1.5"></path><path d="m2 12 1.5 1.5"></path><path d="m20 12 1.5-1.5"></path><path d="m7.5 16.5-1.5 1.5"></path><path d="m16.5 7.5-1.5 1.5"></path></svg>,
  "clipboard-list": <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><path d="M12 11h4"></path><path d="M12 16h4"></path><path d="M8 11h.01"></path><path d="M8 16h.01"></path></svg>,
  "user-plus": <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" x2="19" y1="8" y2="14"></line><line x1="22" x2="16" y1="11" y2="11"></line></svg>,
  "settings": <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>,
  "database": <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>,
  "dollar-sign": <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>,
  "shield": <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
  "layers": <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>,
  "shield-check": <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4"></path><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
};

const visibilityOptions = [
  { value: 'all', label: '全部可见' },
  { value: 'internal', label: '内部人员' },
  { value: 'department', label: '部门可见' },
  { value: 'private', label: '仅自己' },
];

export default function Business() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contactPickerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [clickCounts, setClickCounts] = useState<Record<number, number>>(() => {
    const saved = localStorage.getItem('businessSystemClickCounts');
    return saved ? JSON.parse(saved) : {};
  });

  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    iconUrl: '',
    description: '',
    url: '',
    visibility: 'all',
    domain: 'hr',
    owner: '',
    ownerName: '',
    applicant: '梁吉力',
  });
  const [localSystems, setLocalSystems] = useState<System[]>(systems);

  const filteredSystems = localSystems.filter(system => {
    return system.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           system.description.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getCategorySystems = (categoryId: string) => {
    return filteredSystems.filter(s => s.category === categoryId);
  };

  const getFrequentSystems = () => {
    const allSystems = [...localSystems, ...systems];
    const uniqueSystems = allSystems.filter(
      (system, index, self) => index === self.findIndex(s => s.id === system.id)
    );
    
    return uniqueSystems
      .filter(system => clickCounts[system.id] && clickCounts[system.id] > 0)
      .sort((a, b) => (clickCounts[b.id] || 0) - (clickCounts[a.id] || 0))
      .slice(0, 5);
  };

  const handleSystemClick = (systemId: number) => {
    const newCounts = {
      ...clickCounts,
      [systemId]: (clickCounts[systemId] || 0) + 1
    };
    setClickCounts(newCounts);
    localStorage.setItem('businessSystemClickCounts', JSON.stringify(newCounts));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setIconPreview(result);
        setFormData(prev => ({ ...prev, iconUrl: result, icon: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveIcon = () => {
    setIconPreview(null);
    setFormData(prev => ({ ...prev, iconUrl: '', icon: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectContact = (contact: typeof mockContacts[0]) => {
    setFormData(prev => ({ 
      ...prev, 
      owner: contact.id,
      ownerName: contact.name
    }));
    setShowContactPicker(false);
  };

  const scrollToCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    const element = document.getElementById(`section-${categoryId}`);
    if (element && contentRef.current) {
      const headerOffset = 90;
      const elementPosition = element.getBoundingClientRect().top;
      const scrollTop = contentRef.current.scrollTop;
      const offsetPosition = elementPosition + scrollTop - headerOffset;
      contentRef.current.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const handleScroll = () => {
      const scrollTop = content.scrollTop;
      const categories = categoryGroups.map(cat => ({
        id: cat.id,
        element: document.getElementById(`section-${cat.id}`)
      }));

      for (let i = categories.length - 1; i >= 0; i--) {
        const cat = categories[i];
        if (cat.element && cat.element.offsetTop <= scrollTop + 90) {
          setActiveCategory(cat.id);
          return;
        }
      }
      setActiveCategory('all');
    };

    content.addEventListener('scroll', handleScroll);
    return () => content.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = () => {
    const randomColor = [
      'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500',
      'bg-pink-500', 'bg-rose-500', 'bg-emerald-500', 'bg-teal-500',
      'bg-cyan-500', 'bg-green-500'
    ][Math.floor(Math.random() * 10)];
    
    const newSystem: System = {
      id: Date.now(),
      name: formData.name,
      category: formData.domain,
      description: formData.description,
      icon: formData.icon || 'folder-open',
      color: randomColor,
      iconUrl: formData.iconUrl,
      url: formData.url,
      visibility: formData.visibility,
      owner: formData.owner,
      ownerName: formData.ownerName,
    };
    setLocalSystems(prev => [...prev, newSystem]);
    setShowAddModal(false);
    setFormData({
      name: '',
      icon: '',
      iconUrl: '',
      description: '',
      url: '',
      visibility: 'all',
      domain: 'hr',
      owner: '',
      ownerName: '',
      applicant: '梁吉力',
    });
    setIconPreview(null);
  };

  return (
      <div className="h-full flex flex-col bg-slate-50 dark:bg-gray-900">
        {/* 内联工具栏 — 搜索 + 新增 + 分类筛选 */}
        <div className="shrink-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/60 dark:border-gray-700/60">
          <div className="px-6 py-3 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-slate-400 dark:text-slate-500" />
              </div>
              <input
                type="text"
                placeholder="搜索系统名称..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-gray-700 border-0 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400/30 focus:bg-white dark:focus:bg-gray-700 transition-all"
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-theme-600 text-white rounded-xl hover:bg-theme-700 transition-colors shadow-sm whitespace-nowrap"
            >
              <Plus size={16} />
              <span className="text-sm font-medium">新增</span>
            </button>
          </div>
          <div className="px-6 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => scrollToCategory('all')}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                activeCategory === 'all'
                  ? 'bg-theme-600 text-white shadow-lg shadow-theme-600/30'
                  : 'bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-gray-600'
              }`}
            >
              全部
            </button>
            {categoryGroups.map(cat => (
              <button
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  activeCategory === cat.id
                    ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                    : 'bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-gray-600'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${activeCategory === cat.id ? 'bg-white/70' : cat.color.replace('from-', 'bg-').split(' ')[0]}`}></span>
                <span>{cat.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeCategory === cat.id ? 'bg-white/20' : 'bg-slate-200 dark:bg-gray-600'}`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div ref={contentRef} className="flex-1 overflow-y-auto px-6 py-6">
          {(() => {
            const frequentSystems = getFrequentSystems();
            return frequentSystems.length > 0 && (
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Star size={16} className="text-yellow-500" />
                  <h2 className="text-sm font-medium text-slate-900 dark:text-white">我的常用</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {frequentSystems.map((system) => (
                    <div
                      key={system.id}
                      onClick={() => handleSystemClick(system.id)}
                      className="group flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border border-slate-200/60 dark:border-gray-700 hover:border-yellow-400 hover:bg-yellow-50/50 dark:hover:bg-yellow-900/20 transition-all duration-200 cursor-pointer"
                    >
                      <div className={`w-7 h-7 ${system.color} rounded-md flex items-center justify-center text-white flex-shrink-0`}>
                        {system.iconUrl ? (
                          <img src={system.iconUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          iconMap[system.icon] || <Hexagon size={14} />
                        )}
                      </div>
                      <span className="font-medium text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors text-sm truncate max-w-24">
                        {system.name}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            );
          })()}

          {categoryGroups.map((cat) => {
            const categorySystems = getCategorySystems(cat.id);
            if (categorySystems.length === 0) return null;
            return (
              <section key={cat.id} id={`section-${cat.id}`} className="mb-8 sm:mb-10 lg:mb-12 scroll-mt-24 sm:scroll-mt-28 lg:scroll-mt-32">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className={`w-10 h-10 sm:w-12 lg:w-12 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white shadow-lg`}>
                    <Hexagon size={20} className="sm:hidden" />
                    <Hexagon size={22} className="hidden sm:block" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white">{cat.name}</h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{categorySystems.length} 个系统</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                  {categorySystems.map((system) => (
                    <div
                      key={system.id}
                      onClick={() => handleSystemClick(system.id)}
                      className="group relative bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-200/60 dark:border-gray-700 hover:border-theme-400 hover:shadow-xl hover:shadow-theme-200/50 transition-all duration-300 cursor-pointer overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-theme-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="relative flex items-start gap-3 sm:gap-4">
                        <div className={`relative w-11 h-11 sm:w-13 sm:h-13 ${system.color} rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-md group-hover:scale-105 group-hover:shadow-lg transition-all duration-300 overflow-hidden flex-shrink-0`}>
                          {system.iconUrl ? (
                            <img src={system.iconUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            iconMap[system.icon] || <Hexagon size={22} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5 sm:pt-1">
                          <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-theme-600 transition-colors truncate text-sm sm:text-base lg:text-lg">
                            {system.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 line-clamp-2 leading-relaxed hidden sm:block">
                            {system.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="relative mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-100 dark:border-gray-700 flex items-center justify-between">
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium hidden sm:inline">点击访问</span>
                        <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 group-hover:text-theme-500 transition-colors ml-auto">
                          <span className="text-xs font-medium">进入</span>
                          <ArrowRight size={12} sm:size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}

          {filteredSystems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 lg:py-24">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-slate-100 dark:bg-gray-700 flex items-center justify-center mb-4 sm:mb-6">
                <Search size={28} sm:size={32} lg:size={36} className="text-slate-300 dark:text-slate-500" />
              </div>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium">未找到匹配的系统</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 sm:mt-4 text-sm sm:text-base text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium"
              >
                清除搜索条件
              </button>
            </div>
          )}
        </div>

        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
            <div className="relative bg-white dark:bg-gray-800 w-full h-full sm:h-auto sm:w-full sm:max-w-lg sm:max-h-[90vh] sm:rounded-2xl sm:mx-4 shadow-2xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-gray-700 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-slate-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                    <Hexagon size={18} sm:size={20} className="text-slate-600 dark:text-slate-300" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">新增业务系统</h2>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <X size={20} className="text-slate-500 dark:text-slate-400" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">系统名称 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400/30 focus:border-slate-300 dark:focus:border-gray-500 focus:bg-white dark:focus:bg-gray-700 transition-all"
                    placeholder="请输入系统名称"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">系统图标</label>
                  <div 
                    className="border-2 border-dashed border-slate-200 dark:border-gray-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center hover:border-slate-300 dark:hover:border-gray-500 hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-all cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {iconPreview ? (
                      <div className="relative inline-block">
                        <img src={iconPreview} alt="预览" className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl object-cover mx-auto shadow-md" />
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemoveIcon(); }}
                          className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg"
                        >
                          <X size={12} sm:size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 dark:bg-gray-700 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                          <Upload size={24} sm:size={28} className="text-slate-400 dark:text-slate-500" />
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">点击上传图标</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">支持 PNG、JPG，最大 2MB</p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleIconUpload}
                    className="hidden"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">系统描述</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400/30 focus:border-slate-300 dark:focus:border-gray-500 focus:bg-white dark:focus:bg-gray-700 transition-all resize-none"
                    placeholder="请输入系统描述"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">跳转地址</label>
                  <input
                    type="text"
                    value={formData.url}
                    onChange={(e) => handleInputChange('url', e.target.value)}
                    className="w-full px-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400/30 focus:border-slate-300 dark:focus:border-gray-500 focus:bg-white dark:focus:bg-gray-700 transition-all"
                    placeholder="请输入系统访问地址"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">所属领域</label>
                  <select
                    value={formData.domain}
                    onChange={(e) => handleInputChange('domain', e.target.value)}
                    className="w-full px-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400/30 focus:border-slate-300 dark:focus:border-gray-500 focus:bg-white dark:focus:bg-gray-700 transition-all appearance-none cursor-pointer"
                  >
                    {categoryGroups.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">可见范围</label>
                  <select
                    value={formData.visibility}
                    onChange={(e) => handleInputChange('visibility', e.target.value)}
                    className="w-full px-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400/30 focus:border-slate-300 dark:focus:border-gray-500 focus:bg-white dark:focus:bg-gray-700 transition-all appearance-none cursor-pointer"
                  >
                    {visibilityOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">系统负责人</label>
                  <div className="relative" ref={contactPickerRef}>
                    <div 
                      className="w-full px-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl cursor-pointer hover:border-slate-300 dark:hover:border-gray-500 hover:bg-white dark:hover:bg-gray-700 transition-all"
                      onClick={() => setShowContactPicker(!showContactPicker)}
                    >
                      {formData.ownerName ? (
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                            <User size={14} sm:size={16} className="text-slate-600 dark:text-slate-300" />
                          </div>
                          <span className="text-slate-700 dark:text-slate-200 font-medium text-sm sm:text-base">{formData.ownerName}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 text-sm sm:text-base">请选择系统负责人</span>
                      )}
                    </div>
                    
                    {showContactPicker && (
                      <div className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-xl shadow-xl max-h-48 sm:max-h-60 overflow-y-auto">
                        {mockContacts.map(contact => (
                          <div
                            key={contact.id}
                            className="px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-slate-50 dark:hover:bg-gray-700/50 cursor-pointer border-b border-slate-100 dark:border-gray-700 last:border-b-0 transition-colors"
                            onClick={() => handleSelectContact(contact)}
                          >
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                <User size={14} sm:size={16} className="text-slate-500 dark:text-slate-400" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">{contact.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">{contact.department} · {contact.position}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">申请人</label>
                  <div className="flex items-center gap-2 sm:gap-3 px-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                      <User size={14} sm:size={16} className="text-slate-600 dark:text-slate-300" />
                    </div>
                    <span className="text-slate-700 dark:text-slate-200 font-medium text-sm sm:text-base">{formData.applicant}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-100 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-800">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 border border-slate-200 dark:border-gray-600 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors font-medium text-sm sm:text-base"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!formData.name.trim()}
                  className="px-5 sm:px-6 py-2 sm:py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium shadow-lg shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  提交申请
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    
  );
}
