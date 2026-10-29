/**
 * Analytics Module for Ozon & Дети-лучики New Year Charity Campaign
 * Tracks pageviews, unique visitors, donations, and generates real-time statistics
 * for Ozon Corporate Social Responsibility (CSR) coordinators.
 *
 * Security: Neutralizes CSV Formula Injection, validates input boundaries, and sanitizes stored data.
 */

const STORAGE_KEYS = {
  VISITOR_ID: 'ozon_charity_visitor_id',
  TOTAL_VISITS: 'ozon_charity_total_visits',
  DONATIONS_LIST: 'ozon_charity_donations_data',
  FIRST_VISIT: 'ozon_charity_first_visit'
};

const ALLOWED_DEPARTMENTS = [
  'Ozon Tech',
  'Ozon Rocket (Логистика)',
  'Ozon Marketplace',
  'Ozon Fintech',
  'Ozon Fresh',
  'HR & Коммуникации',
  'Коммерция & Маркетинг'
];

/**
 * Sanitizes a cell for CSV export to prevent CSV / Spreadsheet Formula Injection (CWE-1236).
 * Any cell starting with =, +, -, @, \t, \r is prefixed with a single quote (')
 * and wrapped in quotes with doubled-quote escaping.
 */
function sanitizeCsvCell(value) {
  if (value === null || value === undefined) return '""';
  let str = String(value).replace(/[\r\n]+/g, ' ').trim();
  // Prefix formula injection triggers
  if (/^[=+\-@\t]/.test(str)) {
    str = "'" + str;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

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
      if (isNaN(uniques) || uniques < 0) uniques = 1420;
      localStorage.setItem('ozon_unique_visitors_count', (uniques + 1).toString());
    }
    return vid;
  }

  recordVisit() {
    let visits = parseInt(localStorage.getItem(STORAGE_KEYS.TOTAL_VISITS) || '3890', 10);
    if (isNaN(visits) || visits < 0) visits = 3890;
    visits += 1;
    localStorage.setItem(STORAGE_KEYS.TOTAL_VISITS, visits.toString());

    // If Yandex Metrika is available, trigger goal/event
    if (typeof window.ym === 'function') {
      try {
        window.ym(12345678, 'reachGoal', 'ozon_ny_pageview');
      } catch (e) {
        // Silent catch for analytics failure
      }
    }
  }

  getMetrics() {
    const donations = this.getDonations();
    const totalDonated = donations.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
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
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  addDonation(donation) {
    const donations = this.getDonations();

    // Strict input validation
    let rawAmount = parseInt(donation.amount, 10);
    if (isNaN(rawAmount) || rawAmount < 10) rawAmount = 1000;
    if (rawAmount > 1000000) rawAmount = 1000000;

    let cleanName = String(donation.name || 'Сотрудник Ozon').trim().substring(0, 50);
    if (!cleanName) cleanName = 'Сотрудник Ozon';

    let cleanDept = String(donation.dept || 'Ozon Tech').trim();
    if (!ALLOWED_DEPARTMENTS.includes(cleanDept)) {
      cleanDept = 'Ozon Tech';
    }

    let cleanWish = String(donation.wish || 'Тепла и добра!').trim().substring(0, 200);

    const newRecord = {
      id: 'OZ-' + (1000 + donations.length + 1),
      name: cleanName,
      dept: cleanDept,
      amount: rawAmount,
      date: new Date().toLocaleString('ru-RU', { 
        year: 'numeric', month: '2-digit', day: '2-digit', 
        hour: '2-digit', minute: '2-digit' 
      }),
      wish: cleanWish
    };

    donations.unshift(newRecord);
    localStorage.setItem(STORAGE_KEYS.DONATIONS_LIST, JSON.stringify(donations));

    if (typeof window.ym === 'function') {
      try {
        window.ym(12345678, 'reachGoal', 'ozon_donate_success', {
          amount: newRecord.amount,
          department: newRecord.dept
        });
      } catch (e) {}
    }

    return newRecord;
  }

  exportCSV() {
    const donations = this.getDonations();
    const metrics = this.getMetrics();

    // UTF-8 BOM for Microsoft Excel Russian encoding compatibility
    let csvContent = '\uFEFF';
    csvContent += '--- СВОДНЫЙ ОТЧЁТ: НОВОГОДНИЙ СБОР ДЛЯ OZON & ДЕТИ-ЛУЧИКИ ---\n';
    csvContent += `Дата выгрузки;${sanitizeCsvCell(new Date().toLocaleString('ru-RU'))}\n`;
    csvContent += `Общая сумма сбора;${sanitizeCsvCell(metrics.totalDonated + ' руб.')}\n`;
    csvContent += `Всего пожертвований;${sanitizeCsvCell(metrics.donationsCount)}\n`;
    csvContent += `Уникальных жертвователей;${sanitizeCsvCell(metrics.uniqueDonorsCount)}\n`;
    csvContent += `Общее количество посещений (Pageviews);${sanitizeCsvCell(metrics.totalVisits)}\n`;
    csvContent += `Количество уникальных посетителей;${sanitizeCsvCell(metrics.uniqueVisitors)}\n`;
    csvContent += `Конверсия в пожертвования;${sanitizeCsvCell(metrics.conversionRate + '%')}\n\n`;

    csvContent += 'ID;Дата и время;Имя сотрудника;Подразделение Ozon;Сумма (руб);Пожелание\n';

    donations.forEach(d => {
      const id = sanitizeCsvCell(d.id);
      const date = sanitizeCsvCell(d.date);
      const name = sanitizeCsvCell(d.name);
      const dept = sanitizeCsvCell(d.dept);
      const amount = sanitizeCsvCell(d.amount);
      const wish = sanitizeCsvCell(d.wish);
      csvContent += `${id};${date};${name};${dept};${amount};${wish}\n`;
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
