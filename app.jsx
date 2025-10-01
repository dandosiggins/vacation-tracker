import React, { useState } from 'react';
import { Calendar, Plus, Trash2, Sun, User, Star, Clock, Gift, ChevronLeft, ChevronRight, List, CalendarDays } from 'lucide-react';

export default function VacationTracker() {
  const HOURS_PER_DAY = 7.75;
  const currentYear = new Date().getFullYear();
  
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [viewMode, setViewMode] = useState('list');
  const [yearlyData, setYearlyData] = useState({
    [currentYear]: {
      totals: {
        vacation: 116.25,
        personal: 23.25,
        floater: 15.5
      },
      timeOff: []
    }
  });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    description: '',
    type: 'vacation',
    hours: ''
  });

  const getCurrentYearData = () => {
    if (!yearlyData[selectedYear]) {
      return {
        totals: {
          vacation: 116.25,
          personal: 23.25,
          floater: 15.5
        },
        timeOff: []
      };
    }
    return yearlyData[selectedYear];
  };

  const currentData = getCurrentYearData();
  const totals = currentData.totals;
  const timeOff = currentData.timeOff;

  const updateYearData = (updates) => {
    setYearlyData({
      ...yearlyData,
      [selectedYear]: {
        ...currentData,
        ...updates
      }
    });
  };

  const calculateBusinessDays = (start, end) => {
    let count = 0;
    const current = new Date(start);
    const endDate = new Date(end);
    
    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  };

  const usedHours = {
    vacation: timeOff.filter(t => t.type === 'vacation').reduce((sum, t) => sum + t.hours, 0),
    personal: timeOff.filter(t => t.type === 'personal').reduce((sum, t) => sum + t.hours, 0),
    floater: timeOff.filter(t => t.type === 'floater').reduce((sum, t) => sum + t.hours, 0)
  };

  const remainingHours = {
    vacation: totals.vacation - usedHours.vacation,
    personal: totals.personal - usedHours.personal,
    floater: totals.floater - usedHours.floater
  };

  const statHolidays = timeOff.filter(t => t.type === 'stat');

  const handleSubmit = () => {
    if (formData.startDate && formData.endDate && (formData.hours || formData.type === 'stat')) {
      const days = calculateBusinessDays(formData.startDate, formData.endDate);
      const newTimeOff = {
        id: Date.now(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        description: formData.description,
        type: formData.type,
        hours: formData.type === 'stat' ? 0 : parseFloat(formData.hours),
        days: days
      };
      const updatedTimeOff = [...timeOff, newTimeOff].sort((a, b) => 
        new Date(a.startDate) - new Date(b.startDate)
      );
      updateYearData({ timeOff: updatedTimeOff });
      setFormData({ startDate: '', endDate: '', description: '', type: 'vacation', hours: '' });
      setShowForm(false);
    }
  };

  const deleteTimeOff = (id) => {
    updateYearData({ timeOff: timeOff.filter(t => t.id !== id) });
  };

  const updateTotals = (newTotals) => {
    updateYearData({ totals: newTotals });
  };

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getTypeConfig = (type) => {
    const configs = {
      vacation: { label: 'Vacation', color: 'blue', icon: Sun },
      personal: { label: 'Personal', color: 'purple', icon: User },
      floater: { label: 'Floater', color: 'amber', icon: Star },
      stat: { label: 'Stat Holiday', color: 'green', icon: Gift }
    };
    return configs[type];
  };

  const hoursToDays = (hours) => {
    return (hours / HOURS_PER_DAY).toFixed(2);
  };

  const handleDateChange = () => {
    if (formData.startDate && formData.endDate && formData.type !== 'stat') {
      const days = calculateBusinessDays(formData.startDate, formData.endDate);
      const suggestedHours = days * HOURS_PER_DAY;
      setFormData({...formData, hours: suggestedHours.toString()});
    }
  };

  const changeYear = (direction) => {
    setSelectedYear(selectedYear + direction);
  };

  const getMonthData = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const isDateInRange = (date, startDate, endDate) => {
    const d = new Date(date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return d >= start && d <= end;
  };

  const getTimeOffForDate = (dateString) => {
    return timeOff.filter(item => 
      isDateInRange(dateString, item.startDate, item.endDate)
    );
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="text-indigo-600" size={24} />
              Time Off Tracker
            </h1>
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
                <Clock size={20} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{HOURS_PER_DAY} hrs/day</span>
              </div>
              <div className="flex items-center gap-2 bg-indigo-100 px-3 py-2 rounded-lg">
                <button
                  onClick={() => changeYear(-1)}
                  className="text-indigo-600 hover:text-indigo-800 transition"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-lg font-bold text-indigo-800 min-w-[60px] text-center">
                  {selectedYear}
                </span>
                <button
                  onClick={() => changeYear(1)}
                  className="text-indigo-600 hover:text-indigo-800 transition"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Sun className="text-blue-600" size={18} />
                  <span className="font-semibold text-gray-700 text-sm sm:text-base">Vacation</span>
                </div>
                <input
                  type="number"
                  step="0.25"
                  value={totals.vacation}
                  onChange={(e) => updateTotals({...totals, vacation: e.target.value === '' ? 0 : parseFloat(e.target.value)})}
                  className="w-16 sm:w-20 px-1 sm:px-2 py-1 border border-blue-300 rounded text-center text-xs sm:text-sm"
                  min="0"
                />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Total</span>
                  <span className="font-medium">{hoursToDays(totals.vacation)} days</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Used</span>
                  <span className="text-base sm:text-lg font-bold text-blue-600">{usedHours.vacation.toFixed(2)} hrs</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Remaining</span>
                  <span className="text-base sm:text-lg font-bold text-green-600">{hoursToDays(remainingHours.vacation)} days</span>
                </div>
                <div className="text-right text-xs text-gray-500">
                  ({remainingHours.vacation.toFixed(2)} hrs)
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-3 sm:p-4 border-2 border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1 sm:gap-2">
                  <User className="text-purple-600" size={18} />
                  <span className="font-semibold text-gray-700 text-sm sm:text-base">Personal</span>
                </div>
                <input
                  type="number"
                  step="0.25"
                  value={totals.personal}
                  onChange={(e) => updateTotals({...totals, personal: e.target.value === '' ? 0 : parseFloat(e.target.value)})}
                  className="w-16 sm:w-20 px-1 sm:px-2 py-1 border border-purple-300 rounded text-center text-xs sm:text-sm"
                  min="0"
                />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Total</span>
                  <span className="font-medium">{hoursToDays(totals.personal)} days</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Used</span>
                  <span className="text-base sm:text-lg font-bold text-purple-600">{usedHours.personal.toFixed(2)} hrs</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Remaining</span>
                  <span className="text-base sm:text-lg font-bold text-green-600">{hoursToDays(remainingHours.personal)} days</span>
                </div>
                <div className="text-right text-xs text-gray-500">
                  ({remainingHours.personal.toFixed(2)} hrs)
                </div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-lg p-3 sm:p-4 border-2 border-amber-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Star className="text-amber-600" size={18} />
                  <span className="font-semibold text-gray-700 text-sm sm:text-base">Floater</span>
                </div>
                <input
                  type="number"
                  step="0.25"
                  value={totals.floater}
                  onChange={(e) => updateTotals({...totals, floater: e.target.value === '' ? 0 : parseFloat(e.target.value)})}
                  className="w-16 sm:w-20 px-1 sm:px-2 py-1 border border-amber-300 rounded text-center text-xs sm:text-sm"
                  min="0"
                />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Total</span>
                  <span className="font-medium">{hoursToDays(totals.floater)} days</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Used</span>
                  <span className="text-base sm:text-lg font-bold text-amber-600">{usedHours.floater.toFixed(2)} hrs</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Remaining</span>
                  <span className="text-base sm:text-lg font-bold text-green-600">{hoursToDays(remainingHours.floater)} days</span>
                </div>
                <div className="text-right text-xs text-gray-500">
                  ({remainingHours.floater.toFixed(2)} hrs)
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-3 sm:p-4 border-2 border-green-200">
              <div className="flex items-center gap-1 sm:gap-2 mb-2">
                <Gift className="text-green-600" size={18} />
                <span className="font-semibold text-gray-700 text-sm sm:text-base">Stat Holidays</span>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <div className="text-center py-4 sm:py-6">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600">{statHolidays.length}</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">Scheduled</div>
                </div>
                <div className="text-xs text-gray-500 text-center">
                  No deduction from balance
                </div>
              </div>
            </div>
          </div>

          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <Plus size={20} />
              Add Time Off
            </button>
          )}

          {showForm && (
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4">
              <div className="mb-3 sm:mb-4">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Time Off Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, type: 'vacation', hours: ''})}
                    className={`py-2 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition flex items-center justify-center gap-1 sm:gap-2 ${
                      formData.type === 'vacation'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-300'
                    }`}
                  >
                    <Sun size={16} />
                    <span className="hidden sm:inline">Vacation</span>
                    <span className="sm:hidden">Vac</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, type: 'personal', hours: ''})}
                    className={`py-2 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition flex items-center justify-center gap-1 sm:gap-2 ${
                      formData.type === 'personal'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-purple-300'
                    }`}
                  >
                    <User size={16} />
                    <span className="hidden sm:inline">Personal</span>
                    <span className="sm:hidden">Pers</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, type: 'floater', hours: ''})}
                    className={`py-2 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition flex items-center justify-center gap-1 sm:gap-2 ${
                      formData.type === 'floater'
                        ? 'bg-amber-600 text-white'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-amber-300'
                    }`}
                  >
                    <Star size={16} />
                    <span className="hidden sm:inline">Floater</span>
                    <span className="sm:hidden">Float</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, type: 'stat', hours: '0'})}
                    className={`py-2 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition flex items-center justify-center gap-1 sm:gap-2 ${
                      formData.type === 'stat'
                        ? 'bg-green-600 text-white'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-green-300'
                    }`}
                  >
                    <Gift size={16} />
                    Stat
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => {
                      setFormData({...formData, startDate: e.target.value});
                      if (e.target.value && formData.endDate) {
                        setTimeout(handleDateChange, 0);
                      }
                    }}
                    className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => {
                      setFormData({...formData, endDate: e.target.value});
                      if (formData.startDate && e.target.value) {
                        setTimeout(handleDateChange, 0);
                      }
                    }}
                    className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
              {formData.type !== 'stat' && (
                <div className="mb-3 sm:mb-4">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Hours to Deduct
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={formData.hours}
                    onChange={(e) => setFormData({...formData, hours: e.target.value})}
                    placeholder="e.g., 7.75 for 1 day"
                    className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  {formData.hours && (
                    <div className="text-xs text-gray-500 mt-1">
                      = {hoursToDays(parseFloat(formData.hours))} days
                    </div>
                  )}
                </div>
              )}
              {formData.type === 'stat' && (
                <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="text-xs sm:text-sm text-green-800 flex items-center gap-2">
                    <Gift size={14} />
                    Stat holidays don't deduct from your time off balance
                  </div>
                </div>
              )}
              <div className="mb-3 sm:mb-4">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Description {formData.type === 'stat' ? '(e.g., Christmas, New Year)' : '(Optional)'}
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder={formData.type === 'stat' ? 'e.g., Christmas Day' : 'e.g., Beach trip, Family visit'}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-md transition"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ startDate: '', endDate: '', description: '', type: 'vacation', hours: '' });
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 rounded-md transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
              {viewMode === 'list' ? 'Scheduled Time Off' : 'Calendar View'}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 transition text-sm ${
                  viewMode === 'list'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <List size={18} />
                <span className="hidden sm:inline">List</span>
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 transition text-sm ${
                  viewMode === 'calendar'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <CalendarDays size={18} />
                <span className="hidden sm:inline">Calendar</span>
              </button>
            </div>
          </div>

          {viewMode === 'list' ? (
            <div className="space-y-2 sm:space-y-3">
              {timeOff.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No time off scheduled yet. Click "Add Time Off" to get started!
                </div>
              ) : (
                timeOff.map((item) => {
                  const config = getTypeConfig(item.type);
                  const Icon = config.icon;
                  return (
                    <div
                      key={item.id}
                      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-${config.color}-50 rounded-lg border-2 border-${config.color}-200 hover:shadow-md transition gap-2 sm:gap-0`}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 w-full">
                        <Icon className={`text-${config.color}-600 flex-shrink-0`} size={20} />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                            <span className={`text-xs font-semibold px-2 py-1 rounded bg-${config.color}-200 text-${config.color}-800`}>
                              {config.label}
                            </span>
                            <span className="font-medium text-gray-800 text-sm sm:text-base break-words">
                              {item.startDate === item.endDate 
                                ? `on ${formatDate(item.startDate)}`
                                : `${formatDate(item.startDate)} → ${formatDate(item.endDate)}`
                              }
                            </span>
                          </div>
                          {item.description && (
                            <div className="text-xs sm:text-sm text-gray-600 break-words">{item.description}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        {item.type !== 'stat' ? (
                          <div className="text-right">
                            <div className={`font-bold text-${config.color}-600 text-sm sm:text-base`}>
                              {item.hours.toFixed(2)} hrs
                            </div>
                            <div className="text-xs text-gray-500">
                              ({hoursToDays(item.hours)} days)
                            </div>
                          </div>
                        ) : (
                          <div className="text-right">
                            <div className="font-bold text-green-600 text-sm sm:text-base">
                              No deduction
                            </div>
                            <div className="text-xs text-gray-500">
                              Stat holiday
                            </div>
                          </div>
                        )}
                        <button
                          onClick={() => deleteTimeOff(item.id)}
                          className="text-red-500 hover:text-red-700 transition flex-shrink-0"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {months.map((monthName, monthIndex) => {
                const { daysInMonth, startingDayOfWeek } = getMonthData(selectedYear, monthIndex);
                
                return (
                  <div key={monthIndex} className="bg-white rounded-lg border-2 border-gray-200 p-3">
                    <h3 className="text-center font-bold text-gray-800 mb-2 text-sm">{monthName}</h3>
                    <div className="grid grid-cols-7 gap-1">
                      {dayNames.map(day => (
                        <div key={day} className="text-center text-xs font-semibold text-gray-600 py-1">
                          {day[0]}
                        </div>
                      ))}
                      {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square"></div>
                      ))}
                      {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
                        const day = dayIndex + 1;
                        const dateString = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const timeOffItems = getTimeOffForDate(dateString);
                        const dayOfWeek = new Date(selectedYear, monthIndex, day).getDay();
                        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                        
                        return (
                          <div
                            key={day}
                            className={`aspect-square flex items-center justify-center text-xs rounded relative ${
                              isWeekend ? 'bg-gray-100' : 'bg-white'
                            }`}
                          >
                            <span className={`z-10 relative ${timeOffItems.length > 0 ? 'font-bold text-white' : 'text-gray-700'}`}>
                              {day}
                            </span>
                            {timeOffItems.length > 0 && (
                              <div className="absolute inset-0 rounded overflow-hidden">
                                {timeOffItems.map((item, idx) => {
                                  const config = getTypeConfig(item.type);
                                  const colorMap = {
                                    blue: 'bg-blue-500',
                                    purple: 'bg-purple-500',
                                    amber: 'bg-amber-500',
                                    green: 'bg-green-500'
                                  };
                                  return (
                                    <div
                                      key={item.id}
                                      className={`absolute inset-0 ${colorMap[config.color]} opacity-80`}
                                      style={{ 
                                        top: `${idx * (100 / timeOffItems.length)}%`,
                                        height: `${100 / timeOffItems.length}%`
                                      }}
                                    />
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}