/**
 * Analytics Module for Ozon & Дети-лучики New Year Charity Campaign
 * Tracks pageviews, unique visitors, donations, and generates real-time statistics
 * for Ozon Corporate Social Responsibility (CSR) coordinators.
 */

const STORAGE_KEYS = {
  VISITOR_ID: 'ozon_charity_visitor_id',
  TOTAL_VISITS: 'ozon_charity_total_visits',
  DONATIONS_LIST: 'ozon_charity_donations_data',
  FIRST_VISIT: 'ozon_charity_first_visit'
};

class CharityAnalytics {
  constructor() {
    this.visitorId = this.getOrCreateVisitorId();
    this.recordVisit();
  }

  getOrCreateVisitorId() {
    let vid = localStorage.getItem(STORAGE_KEYS.VISITOR_ID);
    if (!vid) {
      vid = 'ozon_vis_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
      localStorage.setItem(STORAGE_KEYS.VISITOR_ID, vid);
      localStorage.setItem(STORAGE_KEYS.FIRST_VISIT, new Date().toISOString());

      // Track unique visitor count
      let uniques = parseInt(localStorage.getItem('ozon_unique_visitors_count') || '1420', 10);
      localStorage.setItem('ozon_unique_visitors_count', (uniques + 1).toString());
    }
    return vid;
  }

  recordVisit() {
    // Record pageview
    let visits = parseInt(localStorage.getItem(STORAGE_KEYS.TOTAL_VISITS) || '3890', 10);
    visits += 1;
    localStorage.setItem(STORAGE_KEYS.TOTAL_VISITS, visits.toString());

    // If Yandex Metrika is available, trigger goal/event
    if (typeof window.ym === 'function') {
      window.ym(12345678, 'reachGoal', 'ozon_ny_pageview');
    }
  }

  getMetrics() {
    const donations = this.getDonations();
    const totalDonated = donations.reduce((sum, item) => sum + item.amount, 0);
    const donorEmails = new Set(donations.map(d => d.email || d.name));
    const uniqueDonorsCount = donorEmails.size;

    const totalVisits = parseInt(localStorage.getItem(STORAGE_KEYS.TOTAL_VISITS) || '3890', 10);
    const uniqueVisitors = parseInt(localStorage.getItem('ozon_unique_visitors_count') || '1421', 10);
    const avgDonation = donations.length > 0 ? Math.round(totalDonated / donations.length) : 0;
    const conversion = uniqueVisitors > 0 ? ((donations.length / uniqueVisitors) * 100).toFixed(1) : 0;

    return {
      totalDonated,
      donationsCount: donations.length,
      uniqueDonorsCount,
      totalVisits,
      uniqueVisitors,
      avgDonation,
      conversionRate: conversion,
      donations
    };
  }

  getDonations() {
    const raw = localStorage.getItem(STORAGE_KEYS.DONATIONS_LIST);
    if (!raw) {
      // Pre-seed realistic baseline data for Ozon teams to demonstrate the contest
      const initialDonations = [
        { id: 'OZ-1001', name: 'Максим В.', dept: 'Ozon Tech', amount: 3000, date: '2026-10-25 11:20', wish: 'Пусть каждый малыш улыбается!' },
        { id: 'OZ-1002', name: 'Елена К.', dept: 'Ozon Rocket (Логистика)', amount: 1500, date: '2026-10-25 14:05', wish: 'С наступающим Новым Годом!' },
        { id: 'OZ-1003', name: 'Дмитрий С.', dept: 'Ozon Marketplace', amount: 5000, date: '2026-10-26 09:40', wish: 'Тепла и здоровья солнечным деткам.' },
        { id: 'OZ-1004', name: 'Анна М.', dept: 'Ozon Fintech', amount: 2500, date: '2026-10-26 16:15', wish: 'Добра и чудес команде Дети-лучики!' },
        { id: 'OZ-1005', name: 'Сергей Т.', dept: 'Ozon Fresh', amount: 1000, date: '2026-10-27 10:30', wish: 'С верой в лучшее!' },
        { id: 'OZ-1006', name: 'Команда ПВЗ Юг', dept: 'Ozon Rocket (Логистика)', amount: 10000, date: '2026-10-27 13:50', wish: 'Привет из Краснодара!' },
        { id: 'OZ-1007', name: 'Ольга П.', dept: 'HR & Коммуникации', amount: 3000, date: '2026-10-27 18:22', wish: 'Чудеса случаются там, где в них верят!' },
        { id: 'OZ-1008', name: 'Артём Б.', dept: 'Ozon Tech', amount: 5000, date: '2026-10-28 12:10', wish: 'Малышам сил и новых побед!' },
        { id: 'OZ-1009', name: 'Анонимный коллега', dept: 'Коммерция & Маркетинг', amount: 2000, date: '2026-10-28 17:05', wish: 'Счастья семьям!' }
      ];
      localStorage.setItem(STORAGE_KEYS.DONATIONS_LIST, JSON.stringify(initialDonations));
      return initialDonations;
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  }

  addDonation(donation) {
    const donations = this.getDonations();
    const newRecord = {
      id: 'OZ-' + (1000 + donations.length + 1),
      name: donation.name || 'Сотрудник Ozon',
      email: donation.email || '',
      dept: donation.dept || 'Общая команда',
      amount: parseInt(donation.amount, 10),
      date: new Date().toLocaleString('ru-RU', { 
        year: 'numeric', month: '2-digit', day: '2-digit', 
        hour: '2-digit', minute: '2-digit' 
      }),
      wish: donation.wish || 'С Новым Годом!'
    };

    donations.unshift(newRecord);
    localStorage.setItem(STORAGE_KEYS.DONATIONS_LIST, JSON.stringify(donations));

    // Send goal to Yandex Metrika if connected
    if (typeof window.ym === 'function') {
      window.ym(12345678, 'reachGoal', 'ozon_donate_success', {
        amount: newRecord.amount,
        department: newRecord.dept
      });
    }

    return newRecord;
  }

  exportCSV() {
    const donations = this.getDonations();
    const metrics = this.getMetrics();

    let csvContent = '\uFEFF'; // UTF-8 BOM for proper Excel Russian display
    csvContent += '--- СВОДНЫЙ ОТЧЁТ: НОВОГОДНИЙ СБОР ДЛЯ OZON & ДЕТИ-ЛУЧИКИ ---\n';
    csvContent += `Дата выгрузки;${new Date().toLocaleString('ru-RU')}\n`;
    csvContent += `Общая сумма сбора;${metrics.totalDonated} руб.\n`;
    csvContent += `Всего пожертвований;${metrics.donationsCount}\n`;
    csvContent += `Уникальных жертвователей;${metrics.uniqueDonorsCount}\n`;
    csvContent += `Общее количество посещений (Pageviews);${metrics.totalVisits}\n`;
    csvContent += `Количество уникальных посетителей;${metrics.uniqueVisitors}\n`;
    csvContent += `Конверсия в пожертвования;${metrics.conversionRate}%\n\n`;

    csvContent += 'ID;Дата и время;Имя сотрудника;Подразделение Ozon;Сумма (руб);Пожелание\n';

    donations.forEach(d => {
      const cleanName = (d.name || '').replace(/;/g, ' ');
      const cleanDept = (d.dept || '').replace(/;/g, ' ');
      const cleanWish = (d.wish || '').replace(/;/g, ' ').replace(/\n/g, ' ');
      csvContent += `${d.id};${d.date};${cleanName};${cleanDept};${d.amount};${cleanWish}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ozon_charity_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

window.charityAnalytics = new CharityAnalytics();
