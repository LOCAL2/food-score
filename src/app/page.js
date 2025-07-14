'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import { formatNumber } from '@/utils/formatNumber';

const SCORE_LEVELS = [
  { maxScore: 4, name: "Normal", emoji: "😊", color: "#96ceb4" },
  { maxScore: 7, name: "Big", emoji: "😋", color: "#feca57" },
  { maxScore: 10, name: "Very Big", emoji: "🤤", color: "#ff6b6b" },
  { maxScore: 13, name: "Very Very Big", emoji: "😵", color: "#ff9ff3" },
  { maxScore: 16, name: "Double Very Big", emoji: "🤯", color: "#a55eea" },
  { maxScore: 19, name: "Triple Very Big", emoji: "💀", color: "#26de81" },
  { maxScore: 24, name: "Double Double Very Big", emoji: "👻", color: "#fd79a8" },
  { maxScore: Infinity, name: "Elephant Food", emoji: "🐘", color: "#6c5ce7" }
];

export default function Home() {
  const { data: session } = useSession();
  const [meals, setMeals] = useState({
    breakfast: [{ name: '', amount: 1 }],
    lunch: [{ name: '', amount: 1 }],
    dinner: [{ name: '', amount: 1 }]
  });
  const [selectedMeals, setSelectedMeals] = useState(['breakfast']); // เลือกมื้อที่จะคำนวณ
  const [history, setHistory] = useState([]);
  const [isSharedData, setIsSharedData] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [scoreboardStatus, setScoreboardStatus] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [userRank, setUserRank] = useState(null);
  const [isRankLoading, setIsRankLoading] = useState(false);
  const [lastRankUpdate, setLastRankUpdate] = useState(null);

  const addMealItem = (mealType) => {
    setMeals(prev => ({
      ...prev,
      [mealType]: [...prev[mealType], { name: '', amount: 1 }]
    }));
  };

  const updateMealItem = (mealType, index, field, value) => {
    setMeals(prev => {
      const updated = [...prev[mealType]];
      updated[index][field] = value;
      return {
        ...prev,
        [mealType]: updated
      };
    });
  };

  const removeMealItem = (mealType, index) => {
    setMeals(prev => {
      if (prev[mealType].length > 1) {
        return {
          ...prev,
          [mealType]: prev[mealType].filter((_, i) => i !== index)
        };
      }
      return prev;
    });
  };

  const toggleMealSelection = (mealType) => {
    setSelectedMeals(prev => {
      if (prev.includes(mealType)) {
        // ถ้ามีอยู่แล้วให้ลบออก (แต่ต้องมีอย่างน้อย 1 มื้อ)
        return prev.length > 1 ? prev.filter(m => m !== mealType) : prev;
      } else {
        // ถ้าไม่มีให้เพิ่มเข้าไป
        return [...prev, mealType];
      }
    });
  };

  const calculateScore = () => {
    let totalScore = 0;

    selectedMeals.forEach(mealType => {
      const mealItems = meals[mealType] || [];
      const mealScore = mealItems.reduce((total, item) => {
        return total + (item.name.trim() ? item.amount * 2 : 0); // ทุกเมนูอาหารได้ 2 คะแนนต่อจำนวน
      }, 0);
      totalScore += mealScore;
    });

    return totalScore;
  };

  const getScoreLevel = (score) => {
    return SCORE_LEVELS.find(level => score <= level.maxScore) || SCORE_LEVELS[SCORE_LEVELS.length - 1];
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // ฟังก์ชันสำหรับข้อความ Top 3 แบบสุ่ม
  const getTopMessage = (rank) => {
    const messages = {
      1: [
        "🥇 คุณคือที่ 1 ของความหยั่ย!",
      ],
      2: [
        "🥈 คุณคือที่ 2 ของความหยั่ย!",
      ],
      3: [
        "🥉 คุณคือที่ 3 ของความหยั่ย!",
      ]
    };

    const rankMessages = messages[rank];
    if (rankMessages) {
      return rankMessages[Math.floor(Math.random() * rankMessages.length)];
    }
    return null;
  };

  // ฟังก์ชันสำหรับข้อความกำลังใจสำหรับอันดับอื่นๆ
  const getEncouragementMessage = (rank) => {
    if (rank <= 10) {
      return `🔥 อันดับที่ ${rank} - ใกล้ท็อป 3 แล้ว!`;
    } else if (rank <= 20) {
      return `💪 อันดับที่ ${rank} - สู้ต่อไป!`;
    } else {
      return `🎯 อันดับที่ ${rank} - พยายามต่อไป!`;
    }
  };

  // ฟังก์ชันดึงข้อมูล rank ของผู้ใช้
  const fetchUserRank = async (silent = false) => {
    if (!session?.user) {
      console.log('No session, skipping rank fetch');
      return;
    }

    if (!silent) {
      setIsRankLoading(true);
    }

    try {
      console.log('Fetching user rank for:', session.user.id || session.user.email);
      const response = await fetch('/api/scoreboard');
      const data = await response.json();

      if (data.success && data.leaderboard) {
        const currentUser = data.leaderboard.find(entry =>
          entry.userId === session.user.id || entry.userId === session.user.email
        );

        console.log('Current user found:', currentUser);

        if (currentUser) {
          const newRank = currentUser.rank;
          const oldRank = userRank;

          setUserRank(newRank);
          setLastRankUpdate(new Date().toISOString());

          console.log('User rank updated:', oldRank, '->', newRank);

          // แสดง notification ถ้าอันดับเปลี่ยน
          if (oldRank && oldRank !== newRank && !silent) {
            if (newRank < oldRank) {
              showNotification(`🎉 อันดับของคุณขึ้นเป็น #${newRank}!`, 'success');
            } else if (newRank > oldRank) {
              showNotification(`📉 อันดับของคุณลงเป็น #${newRank}`, 'info');
            }
          }
        } else {
          console.log('User not found in leaderboard');
          setUserRank(null);
        }
      }
    } catch (error) {
      console.error('Error fetching user rank:', error);
    } finally {
      if (!silent) {
        setIsRankLoading(false);
      }
    }
  };

  // ฟังก์ชันบันทึกคะแนนไปยัง scoreboard
  const saveToScoreboard = async (score) => {
    try {
      // รวบรวมข้อมูลอาหารจากมื้อที่เลือก
      const allMealItems = [];
      selectedMeals.forEach(mealType => {
        const mealItems = meals[mealType] || [];
        const validItems = mealItems.filter(item => item && typeof item === 'object' && item.name && item.name.trim());
        validItems.forEach(item => {
          allMealItems.push({
            ...item,
            mealType: mealType
          });
        });
      });

      const response = await fetch('/api/scoreboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          score,
          meals: allMealItems,
          selectedMeals: selectedMeals
        })
      });

      const data = await response.json();

      if (data.success) {
        console.log('Scoreboard API response:', data);
        setScoreboardStatus(data);
        showNotification(`🎉 บันทึกคะแนน ${score} คะแนนเรียบร้อยแล้ว!`, 'success');

        // อัพเดท rank ทันทีหลังจากบันทึกคะแนน (ทุกครั้ง)
        setTimeout(() => {
          fetchUserRank(false); // ไม่ silent เพื่อแสดงการเปลี่ยนแปลง
        }, 500);

        setTimeout(() => {
          fetchUserRank(true); // silent check หลัง 2 วินาที
        }, 2000);

        setTimeout(() => {
          fetchUserRank(true); // silent check หลัง 5 วินาที (เผื่อ delay)
        }, 5000);
      } else {
        console.error('Scoreboard API error:', data.error);
      }
    } catch (error) {
      console.error('Error saving to scoreboard:', error);
    }
  };





  const generateStatsImage = () => {
    if (totalScore === 0) {
      showNotification('กรุณากรอกข้อมูลอาหารก่อนสร้างภาพ', 'error');
      return;
    }

    // ตรวจสอบว่า currentLevel มีค่า
    if (!currentLevel || !currentLevel.emoji || !currentLevel.name) {
      showNotification('เกิดข้อผิดพลาดในการสร้างภาพ', 'error');
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // ตั้งค่าขนาด canvas
    canvas.width = 800;
    canvas.height = 600;

    // สร้าง gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // เพิ่มขอบ
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // หัวข้อ
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🍽️ Food Score Calculator', canvas.width / 2, 100);

    // Emoji และระดับ
    ctx.font = 'bold 72px Arial';
    ctx.fillText(currentLevel.emoji || '🍽️', canvas.width / 2, 200);

    ctx.font = 'bold 36px Arial';
    ctx.fillText(`ระดับ: ${currentLevel.name || 'ไม่ระบุ'}`, canvas.width / 2, 260);

    // คะแนน
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${formatNumber(totalScore)} คะแนน`, canvas.width / 2, 320);

    // คำอธิบาย
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(currentLevel.description || '', canvas.width / 2, 370);

    // รายละเอียด
    let totalItems = 0;
    let mealDetails = [];

    selectedMeals.forEach(mealType => {
      const mealItems = meals[mealType] || [];
      const validItems = mealItems.filter(item => item.name.trim());
      const mealScore = validItems.reduce((total, item) => total + item.amount * 2, 0);
      totalItems += validItems.length;

      const mealNames = {
        breakfast: '🍳 มื้อเช้า',
        lunch: '🍽️ มื้อกลางวัน',
        dinner: '🌙 มื้อเย็น'
      };

      if (validItems.length > 0) {
        mealDetails.push(`${mealNames[mealType]} ${validItems.length} รายการ (${formatNumber(mealScore)} คะแนน)`);
      }
    });

    ctx.font = 'bold 20px Arial';
    ctx.fillText(`�️ รวม ${totalItems} รายการอาหาร`, canvas.width / 2, 430);

    // แสดงรายละเอียดมื้ออาหาร
    mealDetails.forEach((detail, index) => {
      ctx.fillText(detail, canvas.width / 2, 460 + (index * 25));
    });

    // วันที่
    ctx.font = '16px Arial';
    ctx.fillStyle = '#cccccc';
    ctx.fillText(`สร้างเมื่อ: ${new Date().toLocaleString('th-TH')}`, canvas.width / 2, 520);

    // ดาวน์โหลดภาพ
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `food-score-${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  };



  const copyShareLink = () => {
    if (totalScore === 0) {
      showNotification('กรุณากรอกข้อมูลอาหารก่อนสร้างลิงก์', 'error');
      return;
    }



    // สร้างข้อมูลที่จะเข้ารหัส (ย่อให้สั้นที่สุด)
    const shareData = {
      v: 2, // version 2 สำหรับโครงสร้างใหม่
      s: totalScore, // score เท่านั้น - คำนวณ level ใหม่ตอนโหลด
      meals: {}, // เก็บข้อมูลอาหารแยกตามมื้อ
      selectedMeals: selectedMeals // เก็บมื้อที่เลือก
    };

    // เก็บข้อมูลอาหารแยกตามมื้อ
    selectedMeals.forEach(mealType => {
      const mealItems = meals[mealType] || [];
      const validItems = mealItems.filter(item => item.name.trim());
      if (validItems.length > 0) {
        shareData.meals[mealType] = validItems.map(item => [item.name, item.amount]);
      }
    });

    try {
      // เข้ารหัสข้อมูลด้วย Base64 (รองรับ Unicode)
      const jsonString = JSON.stringify(shareData);
      const encodedData = btoa(encodeURIComponent(jsonString));
      const shareUrl = `${window.location.origin}${window.location.pathname}?data=${encodedData}`;

      navigator.clipboard.writeText(shareUrl).then(() => {
        showNotification('คัดลอกลิงก์แชร์แล้ว! ส่งให้เพื่อนเพื่อดูผลคะแนนของคุณ');
      }).catch(() => {
        // Fallback สำหรับเบราว์เซอร์เก่า
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('คัดลอกลิงก์แชร์แล้ว! ส่งให้เพื่อนเพื่อดูผลคะแนนของคุณ');
      });
    } catch (error) {
      console.error('Error creating share link:', error);
      showNotification('เกิดข้อผิดพลาดในการสร้างลิงก์แชร์', 'error');
    }
  };



  const copyLinkFromHistory = (record) => {
    // สร้างข้อมูลที่จะเข้ารหัส (ย่อให้สั้นที่สุด)
    let shareData;

    if (record.meals && record.selectedMeals) {
      // โครงสร้างใหม่
      shareData = {
        v: 2, // version 2
        s: record.totalScore,
        meals: {},
        selectedMeals: record.selectedMeals
      };

      // แปลงข้อมูลอาหารตามมื้อ
      record.selectedMeals.forEach(mealType => {
        const mealItems = record.meals.filter(item => item.mealType === mealType);
        if (mealItems.length > 0) {
          shareData.meals[mealType] = mealItems.map(item => [item.name, item.amount]);
        }
      });
    } else {
      // โครงสร้างเก่า (backward compatibility)
      shareData = {
        v: 1, // version
        s: record.totalScore, // score เท่านั้น
        m: (record.mainDishes || []).map(d => [d.name, d.amount]), // [name, amount]
        d: (record.sideDishes || []).map(d => [d.name, d.amount])  // [name, amount]
      };
    }

    try {
      // เข้ารหัสข้อมูลด้วย Base64 (รองรับ Unicode)
      const jsonString = JSON.stringify(shareData);
      const encodedData = btoa(encodeURIComponent(jsonString));
      const shareUrl = `${window.location.origin}${window.location.pathname}?data=${encodedData}`;

      navigator.clipboard.writeText(shareUrl).then(() => {
        showNotification('คัดลอกลิงก์แล้ว! ส่งให้เพื่อนเพื่อดูผลคะแนน');
      }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('คัดลอกลิงก์แล้ว! ส่งให้เพื่อนเพื่อดูผลคะแนน');
      });
    } catch (error) {
      console.error('Error creating share link from history:', error);
      showNotification('เกิดข้อผิดพลาดในการสร้างลิงก์แชร์', 'error');
    }
  };

  const generateImageFromHistory = (record) => {
    // ตรวจสอบข้อมูล record
    if (!record || !record.emoji || !record.level || !record.breakdown) {
      showNotification('เกิดข้อผิดพลาดในการสร้างภาพจากประวัติ', 'error');
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 800;
    canvas.height = 600;

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🍽️ Food Score Calculator', canvas.width / 2, 100);

    ctx.font = 'bold 72px Arial';
    ctx.fillText(record.emoji || '🍽️', canvas.width / 2, 200);

    ctx.font = 'bold 36px Arial';
    ctx.fillText(`ระดับ: ${record.level || 'ไม่ระบุ'}`, canvas.width / 2, 260);

    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${record.totalScore || 0} คะแนน`, canvas.width / 2, 320);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(record.description || '', canvas.width / 2, 370);

    ctx.font = 'bold 20px Arial';

    if (record.breakdown && record.breakdown.mealBreakdown) {
      // โครงสร้างใหม่
      ctx.fillText(`🍽️ รวม ${record.breakdown.totalItems || 0} รายการอาหาร`, canvas.width / 2, 430);

      let yPos = 460;
      Object.entries(record.breakdown.mealBreakdown).forEach(([mealType, data]) => {
        const mealNames = {
          breakfast: '🍳 มื้อเช้า',
          lunch: '🍽️ มื้อกลางวัน',
          dinner: '🌙 มื้อเย็น'
        };

        if (data.count > 0) {
          ctx.fillText(`${mealNames[mealType]} ${data.count} รายการ (${formatNumber(data.score)} คะแนน)`, canvas.width / 2, yPos);
          yPos += 25;
        }
      });
    } else {
      // โครงสร้างเก่า (backward compatibility)
      ctx.fillText(`🍛 อาหารหลัก ${record.breakdown?.mainDishCount || 0} รายการ (${formatNumber(record.breakdown?.mainScore || 0)} คะแนน)`, canvas.width / 2, 430);
      ctx.fillText(`🥗 เครื่องเคียง ${record.breakdown?.sideDishCount || 0} รายการ (${formatNumber(record.breakdown?.sideScore || 0)} คะแนน)`, canvas.width / 2, 460);
    }

    ctx.font = '16px Arial';
    ctx.fillStyle = '#cccccc';
    ctx.fillText(`สร้างเมื่อ: ${record.timestamp}`, canvas.width / 2, 520);

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `food-score-${record.level}-${record.totalScore}pts.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showNotification('ดาวน์โหลดภาพเรียบร้อยแล้ว!');
    });
  };

  const saveToHistory = async () => {
    if (totalScore === 0) {
      showNotification('กรุณากรอกข้อมูลอาหารก่อนบันทึก', 'error');
      return;
    }

    setIsSaving(true);

    try {
      // รวบรวมข้อมูลอาหารจากมื้อที่เลือก
      const allMealItems = [];
      let totalItems = 0;
      let mealBreakdown = {};

      selectedMeals.forEach(mealType => {
        const mealItems = meals[mealType] || [];
        const validItems = mealItems.filter(item => item && typeof item === 'object' && item.name && item.name.trim());
        const mealScore = validItems.reduce((total, item) => total + (item.amount || 0) * 2, 0);

        totalItems += validItems.length;
        mealBreakdown[mealType] = {
          count: validItems.length,
          score: mealScore,
          items: validItems
        };

        validItems.forEach(item => {
          allMealItems.push({
            ...item,
            mealType: mealType
          });
        });
      });

      const newRecord = {
        id: Date.now(),
        timestamp: new Date().toLocaleString('th-TH'),
        level: currentLevel.name,
        emoji: currentLevel.emoji,
        totalScore: totalScore,
        description: currentLevel.description,
        meals: allMealItems,
        selectedMeals: selectedMeals,
        breakdown: {
          totalItems: totalItems,
          mealBreakdown: mealBreakdown
        }
      };

      const updatedHistory = [newRecord, ...history.slice(0, 9)]; // เก็บแค่ 10 รายการล่าสุด
      setHistory(updatedHistory);

      // บันทึกลง localStorage
      localStorage.setItem('foodScoreHistory', JSON.stringify(updatedHistory));

      // บันทึกคะแนนไปยัง scoreboard
      await saveToScoreboard(totalScore);

      // อัพเดท rank ทันทีหลังจากบันทึก (หลายครั้งเพื่อให้แน่ใจ)
      setTimeout(() => {
        fetchUserRank(false); // ไม่ silent เพื่อแสดงการเปลี่ยนแปลง
      }, 500);

      setTimeout(() => {
        fetchUserRank(true); // silent check หลัง 2 วินาที
      }, 2000);

      setTimeout(() => {
        fetchUserRank(true); // silent check หลัง 5 วินาที (เผื่อ delay)
      }, 5000);

      showNotification('🎉 บันทึกคะแนนและประวัติเรียบร้อยแล้ว!', 'success');
    } catch (error) {
      console.error('Error saving:', error);
      showNotification('เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('foodScoreHistory');
    setShowClearConfirm(false);
    showNotification('ลบประวัติเรียบร้อยแล้ว!');
  };

  // โหลดประวัติจาก localStorage และตรวจสอบ URL parameters เมื่อเริ่มต้น
  useEffect(() => {
    const savedHistory = localStorage.getItem('foodScoreHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // useEffect แยกสำหรับ session เพื่อตรวจสอบอันดับทันทีหลัง login
  useEffect(() => {
    if (session) {
      console.log('Session detected, fetching rank immediately...');

      // ดึงข้อมูล rank ทันทีหลัง login (ไม่ silent เพื่อแสดง loading)
      fetchUserRank(false);

      // ลอง setup Supabase real-time subscription
      let subscription = null;

      const setupRealtimeSubscription = async () => {
        if (supabase) {
          try {
            subscription = supabase
              .channel('scoreboard_rank_changes')
              .on('postgres_changes',
                {
                  event: '*',
                  schema: 'public',
                  table: 'scoreboard'
                },
                (payload) => {
                  console.log('Scoreboard real-time update:', payload);
                  // อัพเดท rank เมื่อมีการเปลี่ยนแปลงใน scoreboard (silent mode)
                  setTimeout(() => {
                    fetchUserRank(true);
                  }, 500);
                }
              )
              .subscribe();
          } catch (error) {
            console.log('Real-time subscription failed, using polling fallback');
          }
        }
      };

      setupRealtimeSubscription();

      // Fallback polling สำหรับ rank ทุก 15 วินาที
      const rankInterval = setInterval(() => {
        fetchUserRank(true); // silent mode สำหรับ polling
      }, 1500);

      // Cleanup interval และ subscription เมื่อ component unmount หรือ session เปลี่ยน
      return () => {
        if (subscription && supabase) {
          supabase.removeChannel(subscription);
        }
        clearInterval(rankInterval);
      };
    } else {
      // ถ้าไม่มี session ให้ clear rank
      setUserRank(null);
      setLastRankUpdate(null);
    }
  }, [session]); // dependency เฉพาะ session

  // useEffect สำหรับ URL parameters
  useEffect(() => {

    // ตรวจสอบ URL parameters สำหรับข้อมูลที่แชร์
    const urlParams = new URLSearchParams(window.location.search);

    // รองรับทั้งรูปแบบเก่า (backward compatibility) และรูปแบบใหม่
    if (urlParams.has('data')) {
      try {
        // ถอดรหัสข้อมูลจาก Base64 (รองรับ Unicode)
        const encodedData = urlParams.get('data');
        const decodedString = decodeURIComponent(atob(encodedData));
        const decodedData = JSON.parse(decodedString);

        // ตรวจสอบ version และโครงสร้างข้อมูล
        if (decodedData.v === 2 && decodedData.meals && decodedData.selectedMeals) {
          // โหลดข้อมูลรูปแบบใหม่ (version 2)
          const newMeals = {
            breakfast: [{ name: '', amount: 1 }],
            lunch: [{ name: '', amount: 1 }],
            dinner: [{ name: '', amount: 1 }]
          };

          // โหลดข้อมูลอาหารแยกตามมื้อ
          Object.keys(decodedData.meals).forEach(mealType => {
            if (decodedData.meals[mealType] && decodedData.meals[mealType].length > 0) {
              newMeals[mealType] = decodedData.meals[mealType].map(item => ({
                name: item[0],
                amount: item[1]
              }));
            }
          });

          setMeals(newMeals);
          setSelectedMeals(decodedData.selectedMeals);
          setIsSharedData(true);

          setTimeout(() => {
            showNotification(`โหลดข้อมูลที่แชร์แล้ว!`, 'info');
          }, 1000);
        } else if (decodedData.v === 1 && decodedData.m && decodedData.d) {
          // รองรับรูปแบบเก่า version 1 - แปลงเป็นรูปแบบใหม่
          const newMeals = {
            breakfast: [{ name: '', amount: 1 }],
            lunch: [{ name: '', amount: 1 }],
            dinner: [{ name: '', amount: 1 }]
          };

          // แปลงอาหารหลักเป็นมื้อเช้า
          if (decodedData.m.length > 0) {
            newMeals.breakfast = decodedData.m.map(d => ({ name: d[0], amount: d[1] }));
          }

          // แปลงเครื่องเคียงเป็นมื้อกลางวัน
          if (decodedData.d.length > 0) {
            newMeals.lunch = decodedData.d.map(d => ({ name: d[0], amount: d[1] }));
          }

          setMeals(newMeals);
          setSelectedMeals(['breakfast', 'lunch']);
          setIsSharedData(true);

          setTimeout(() => {
            showNotification(`โหลดข้อมูลที่แชร์แล้ว! (แปลงจากรูปแบบเก่า)`, 'info');
          }, 1000);
        } else if (decodedData.v === 1 && decodedData.md && decodedData.sd) {
          // รองรับรูปแบบเก่า (backward compatibility)
          const newMeals = {
            breakfast: [{ name: '', amount: 1 }],
            lunch: [{ name: '', amount: 1 }],
            dinner: [{ name: '', amount: 1 }]
          };

          if (decodedData.md.length > 0) {
            newMeals.breakfast = decodedData.md.map(d => ({ name: d.n, amount: d.a }));
          }

          if (decodedData.sd.length > 0) {
            newMeals.lunch = decodedData.sd.map(d => ({ name: d.n, amount: d.a }));
          }

          setMeals(newMeals);
          setSelectedMeals(['breakfast', 'lunch']);
          setIsSharedData(true);

          setTimeout(() => {
            showNotification(`โหลดข้อมูลที่แชร์แล้ว! (แปลงจากรูปแบบเก่า)`, 'info');
          }, 1000);
        }
      } catch (error) {
        console.error('Error decoding shared data:', error);
        showNotification('ลิงก์ที่แชร์ไม่ถูกต้องหรือเสียหาย', 'error');
      }
    } else if (urlParams.has('score')) {
      // รองรับรูปแบบเก่าสำหรับ backward compatibility
      const sharedMainDishes = urlParams.get('mainDishes');
      const sharedSideDishes = urlParams.get('sideDishes');

      const newMeals = {
        breakfast: [{ name: '', amount: 1 }],
        lunch: [{ name: '', amount: 1 }],
        dinner: [{ name: '', amount: 1 }]
      };

      if (sharedMainDishes && sharedMainDishes !== '') {
        const parsedMainDishes = sharedMainDishes.split(',').map(dish => {
          const match = dish.match(/^(.+)\((\d+)\)$/);
          return match ? { name: match[1], amount: parseInt(match[2]) } : { name: dish, amount: 1 };
        });
        newMeals.breakfast = parsedMainDishes;
      }

      if (sharedSideDishes && sharedSideDishes !== '') {
        const parsedSideDishes = sharedSideDishes.split(',').map(dish => {
          const match = dish.match(/^(.+)\((\d+)\)$/);
          return match ? { name: match[1], amount: parseInt(match[2]) } : { name: dish, amount: 1 };
        });
        newMeals.lunch = parsedSideDishes;
      }

      setMeals(newMeals);
      setSelectedMeals(['breakfast', 'lunch']);
      setIsSharedData(true);

      setTimeout(() => {
        showNotification(`โหลดข้อมูลที่แชร์แล้ว! (แปลงจากรูปแบบเก่า)`, 'info');
      }, 1000);
    }
  }, []);

  const totalScore = calculateScore();
  const currentLevel = getScoreLevel(totalScore);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200" data-theme="cupcake">
        <Header />

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="p-4 text-center">
            <div className="bg-base-200 p-3 rounded-lg inline-block text-sm">
              <div>Session: {session?.user?.name || 'No session'}</div>
              <div>User ID: {session?.user?.id || session?.user?.email || 'No ID'}</div>
              <div>Current Rank: {userRank || 'No rank'}</div>
              <div>Last Update: {lastRankUpdate ? new Date(lastRankUpdate).toLocaleTimeString() : 'Never'}</div>
              <div>Supabase: {supabase ? '✅ Connected' : '❌ Not available'}</div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => fetchUserRank(false)}
                  className={`btn btn-xs btn-primary ${isRankLoading ? 'loading' : ''}`}
                  disabled={isRankLoading}
                >
                  {isRankLoading ? 'Loading...' : 'Refresh Rank'}
                </button>
                <button
                  onClick={() => fetchUserRank(true)}
                  className="btn btn-xs btn-ghost"
                >
                  Silent Refresh
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ข้อความพิเศษสำหรับ Top 3 */}
        {session && (
          <div className="p-4 text-center">
            {isRankLoading && !userRank ? (
              <div className="inline-block bg-base-200 px-6 py-3 rounded-full font-bold text-lg shadow-lg">
                <span className="loading loading-spinner loading-sm mr-2"></span>
                กำลังตรวจสอบอันดับ...
              </div>
            ) : userRank && userRank <= 3 ? (
              <div className="inline-block bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg animate-bounce">
                {getTopMessage(userRank)}
              </div>
            ) : userRank && userRank > 3 ? (
              <div className="inline-block bg-base-200 px-6 py-3 rounded-full font-bold text-lg shadow-lg">
                {getEncouragementMessage(userRank)}
              </div>
            ) : !isRankLoading && !userRank && session ? (
              <div className="inline-block bg-info/20 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg">
                บันทึกคะแนนแรกเพื่อเข้าสู่การแข่งขัน!
              </div>
            ) : null}
          </div>
        )}

        <div className="p-4">
      {/* Notification Toast */}
      {notification && (
        <div className="toast toast-top toast-center z-50">
          <div className={`alert ${
            notification.type === 'success' ? 'alert-success' :
            notification.type === 'error' ? 'alert-error' :
            notification.type === 'info' ? 'alert-info' : 'alert-success'
          } shadow-lg`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {notification.type === 'success' && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              )}
              {notification.type === 'error' && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              )}
              {notification.type === 'info' && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
            </svg>
            <span>{notification.message}</span>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => setNotification(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Food Score Calculator
          </h1>
          <p className="text-base-content/70 text-lg">คำนวณคะแนนอาหารของคุณ</p>

          {/* แสดงแบนเนอร์เมื่อมีการแชร์ข้อมูล */}
          {isSharedData && (
            <div className="alert alert-warning mt-4 shadow-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h3 className="font-bold">โหมดดูข้อมูลที่แชร์</h3>
                <div className="text-sm">คุณกำลังดูผลคะแนนที่ถูกแชร์มา</div>
              </div>
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => {
                  setIsSharedData(false);
                  setMeals({
                    breakfast: [{ name: '', amount: 1 }],
                    lunch: [{ name: '', amount: 1 }],
                    dinner: [{ name: '', amount: 1 }]
                  });
                  setSelectedMeals(['breakfast']);
                  window.history.replaceState({}, '', window.location.pathname);
                }}
              >
                ✕ ออกจากโหมดดู
              </button>
            </div>
          )}
        </div>

        {/* เลือกมื้ออาหาร */}
        <div className="card bg-base-100 shadow-xl mb-8 border border-accent/20">
          <div className="card-body">
            <h2 className="card-title text-2xl text-accent mb-4 flex items-center justify-center">
               เลือกมื้ออาหารที่ต้องการคำนวณ
            </h2>

            <div className="flex flex-wrap gap-4 justify-center">
              {[
                { key: 'breakfast', name: 'มื้อเช้า', emoji: '🌞', color: 'btn-warning' },
                { key: 'lunch', name: 'กลางวัน', color: 'btn-info' },
                { key: 'dinner', name: 'เย็น', color: 'btn-secondary' }
              ].map(meal => (
                <button
                  key={meal.key}
                  onClick={() => toggleMealSelection(meal.key)}
                  disabled={isSharedData}
                  className={`btn btn-lg gap-2 shadow-lg transition-all duration-200 ${
                    selectedMeals.includes(meal.key)
                      ? `${meal.color} hover:shadow-xl transform hover:scale-105`
                      : 'btn-outline hover:shadow-md'
                  } ${isSharedData ? 'btn-disabled opacity-50' : ''}`}
                >
                  {meal.name}
                  {selectedMeals.includes(meal.key) && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ฟอร์มกรอกอาหารสำหรับแต่ละมื้อ */}
        <div className="grid gap-8">
          {selectedMeals.map(mealType => {
            const mealConfig = {
              breakfast: { name: 'มื้อเช้า', emoji: '🌞', color: 'warning' },
              lunch: { name: 'มื้อกลางวัน', emoji: '🍽️', color: 'info' },
              dinner: { name: 'มื้อเย็น', emoji: '🌙', color: 'secondary' }
            };

            const config = mealConfig[mealType];
            const mealItems = meals[mealType] || [];

            return (
              <div key={mealType} className={`card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 border border-${config.color}/20`}>
                <div className="card-body">
                  <h2 className={`card-title text-2xl text-${config.color} mb-4 flex items-center`}>
                    <span className="text-3xl mr-2">{config.emoji}</span>
                    {config.name}
                  </h2>

                  {mealItems.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="ชื่อเมนูอาหาร"
                        value={item.name}
                        onChange={(e) => updateMealItem(mealType, index, 'name', e.target.value)}
                        disabled={isSharedData}
                        className={`input input-bordered input-${config.color} flex-1 shadow-sm focus:shadow-md transition-all duration-200 ${
                          isSharedData ? 'input-disabled bg-base-200' : ''
                        }`}
                      />
                      <input
                        type="number"
                        min="1"
                        value={item.amount}
                        onChange={(e) => updateMealItem(mealType, index, 'amount', parseInt(e.target.value) || 1)}
                        disabled={isSharedData}
                        className={`input input-bordered input-${config.color} w-20 shadow-sm focus:shadow-md transition-all duration-200 ${
                          isSharedData ? 'input-disabled bg-base-200' : ''
                        }`}
                      />
                      {mealItems.length > 1 && !isSharedData && (
                        <button
                          onClick={() => removeMealItem(mealType, index)}
                          className="btn btn-error btn-sm px-3 shadow-md hover:shadow-lg transform hover:scale-110 transition-all duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    onClick={() => addMealItem(mealType)}
                    disabled={isSharedData}
                    className={`btn btn-${config.color} w-full mt-3 gap-2 shadow-lg transition-all duration-200 border-none ${
                      isSharedData
                        ? 'btn-disabled opacity-50 cursor-not-allowed'
                        : 'hover:shadow-xl transform hover:scale-105'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    เพิ่มเมนูอาหาร{config.name}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ผลลัพธ์ */}
        <div className="card bg-base-100 shadow-2xl mt-8 border-2 border-accent/30 hover:border-accent/50 transition-all duration-300">
          <div className="card-body">
            <h2 className="card-title text-3xl text-accent mb-6 text-center justify-center">
              📊 ผลคะแนน
            </h2>

          <div className="text-center">
            <div className="text-6xl mb-4">{currentLevel.emoji}</div>
            <div
              className="text-4xl font-bold mb-2"
              style={{ color: currentLevel.color }}
            >
              {formatNumber(totalScore)} คะแนน
            </div>
            <div
              className="text-2xl font-semibold mb-2"
              style={{ color: currentLevel.color }}
            >
              {currentLevel.name}
            </div>

            {/* Scoreboard Status */}
            {scoreboardStatus && (
              <div className="mt-4">
                {scoreboardStatus.isNewRecord ? (
                  <div className="badge badge-success badge-lg gap-2">
                    🎉 สถิติใหม่!
                  </div>
                ) : (
                  <div className="text-sm text-base-content/60">
                    สถิติสูงสุด: {scoreboardStatus.highestScore} คะแนน
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-4 mt-6">
            {/* Primary Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={saveToHistory}
                disabled={totalScore === 0 || isSharedData || isSaving}
                className={`btn btn-lg gap-3 shadow-xl transition-all duration-300 ${
                  totalScore === 0 || isSharedData || isSaving
                    ? 'btn-disabled opacity-50 cursor-not-allowed'
                    : 'btn-success hover:btn-success hover:shadow-2xl transform hover:scale-105 active:scale-95'
                }`}
              >
                {isSaving ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {isSharedData ? 'ไม่สามารถบันทึกข้อมูลที่แชร์ได้' : 'บันทึกคะแนนและประวัติ'}
                  </>
                )}
              </button>

              <div className="tooltip" data-tip="ดูการจัดอันดับและคะแนนสูงสุดของผู้เล่นทั้งหมด">
                <a
                  href="/scoreboard"
                  className="btn btn-lg btn-primary gap-3 shadow-xl transition-all duration-300 hover:shadow-2xl transform hover:scale-105 active:scale-95 group w-full"
                >
                  <svg className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="flex items-center gap-2">
                    🏆 ดูตารางคะแนน
                    <span className="badge badge-sm bg-white/20 text-white border-none">LIVE</span>
                  </span>
                </a>
              </div>
            </div>

            {/* Secondary Actions */}
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={copyShareLink}
                disabled={totalScore === 0}
                className={`btn btn-accent gap-2 shadow-lg transition-all duration-200 ${
                  totalScore === 0
                    ? 'btn-disabled opacity-50 cursor-not-allowed'
                    : 'hover:shadow-xl transform hover:scale-105'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                คัดลอกลิงก์แชร์
              </button>

              <button
                onClick={generateStatsImage}
                disabled={totalScore === 0}
                className={`btn btn-info gap-2 shadow-lg transition-all duration-200 ${
                  totalScore === 0
                    ? 'btn-disabled opacity-50 cursor-not-allowed'
                    : 'hover:shadow-xl transform hover:scale-105'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                สร้างภาพ
              </button>
            </div>
          </div>



          <div className="divider"></div>

          <div className="bg-base-200 rounded-xl p-6 shadow-inner">
            <h3 className="text-lg font-bold text-base-content mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              รายละเอียดการคำนวณ
            </h3>
            <div className="space-y-3">
              {selectedMeals.map(mealType => {
                const mealConfig = {
                  breakfast: { name: 'มื้อเช้า', emoji: '�', color: 'warning' },
                  lunch: { name: 'มื้อกลางวัน', emoji: '🍽️', color: 'info' },
                  dinner: { name: 'มื้อเย็น', emoji: '🌙', color: 'secondary' }
                };

                const config = mealConfig[mealType];
                const mealItems = meals[mealType] || [];
                const validItems = mealItems.filter(item => item.name.trim());
                const mealScore = validItems.reduce((total, item) => total + item.amount * 2, 0);

                return (
                  <div key={mealType} className={`flex justify-between items-center p-3 bg-${config.color}/10 rounded-lg`}>
                    <span className={`text-${config.color} font-medium`}>
                      {config.emoji} {config.name}
                    </span>
                    <span className={`badge badge-${config.color} badge-lg`}>
                      {validItems.length} รายการ × 2 = {formatNumber(mealScore)} คะแนน
                    </span>
                  </div>
                );
              })}
              <div className="divider my-2"></div>
              <div className="flex justify-between items-center p-4 bg-accent/20 rounded-lg border-2 border-accent/30">
                <span className="text-accent font-bold text-lg">🎯 คะแนนรวม</span>
                <span className="badge badge-accent badge-lg text-lg font-bold">{formatNumber(totalScore)} คะแนน</span>
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* ประวัติการคำนวณ */}
        {history.length > 0 && (
          <div className="card bg-base-100 shadow-xl mt-8 border border-warning/20">
            <div className="card-body">
              <div className="flex justify-between items-center mb-4">
                <h2 className="card-title text-2xl text-warning">
                  📚 ประวัติการคำนวณ
                </h2>
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="btn btn-error btn-sm"
                >
                  ลบประวัติ
                </button>
              </div>

              <div className="grid gap-4 max-h-96 overflow-y-auto">
                {history.map((record) => (
                  <div key={record.id} className="bg-base-200 rounded-lg p-4 border border-base-300">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{record.emoji}</span>
                        <div>
                          <div className="font-bold text-lg" style={{ color: record.level === 'Elephant Food' ? '#6c5ce7' : 'inherit' }}>
                            {record.level} - {formatNumber(record.totalScore)} คะแนน
                          </div>
                          <div className="text-sm text-base-content/70">
                            {record.timestamp}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-base-content/80 mb-2">
                      {record.description}
                    </div>

                    <div className="flex gap-2 text-xs mb-3 flex-wrap">
                      {record.breakdown && record.breakdown.mealBreakdown ? (
                        // โครงสร้างใหม่
                        Object.entries(record.breakdown.mealBreakdown).map(([mealType, data]) => {
                          const mealConfig = {
                            breakfast: { name: 'เช้า', emoji: '�', color: 'warning' },
                            lunch: { name: 'กลางวัน', emoji: '🍽️', color: 'info' },
                            dinner: { name: 'เย็น', emoji: '🌙', color: 'secondary' }
                          };
                          const config = mealConfig[mealType];

                          return data.count > 0 ? (
                            <span key={mealType} className={`badge badge-${config.color} badge-sm`}>
                              {config.emoji} {config.name} {data.count} รายการ ({formatNumber(data.score)} คะแนน)
                            </span>
                          ) : null;
                        })
                      ) : (
                        // โครงสร้างเก่า (backward compatibility)
                        <>
                          <span className="badge badge-primary badge-sm">
                            🍛 {record.breakdown?.mainDishCount || 0} รายการ ({formatNumber(record.breakdown?.mainScore || 0)} คะแนน)
                          </span>
                          <span className="badge badge-success badge-sm">
                            🥗 {record.breakdown?.sideDishCount || 0} รายการ ({formatNumber(record.breakdown?.sideScore || 0)} คะแนน)
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => copyLinkFromHistory(record)}
                        className="btn btn-xs btn-accent gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        แชร์ลิงก์
                      </button>

                      <button
                        onClick={() => generateImageFromHistory(record)}
                        className="btn btn-xs btn-info gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        สร้างภาพ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {showClearConfirm && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg">ยืนยันการลบประวัติ</h3>
              <p className="py-4">ต้องการลบประวัติการคำนวณทั้งหมดหรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้</p>
              <div className="modal-action">
                <button
                  className="btn btn-error"
                  onClick={clearHistory}
                >
                  ลบประวัติ
                </button>
                <button
                  className="btn"
                  onClick={() => setShowClearConfirm(false)}
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
}
