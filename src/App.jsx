import React, { useState } from 'react';
import { PlusCircle, TrendingUp, TrendingDown, Wallet, AlertTriangle, DollarSign, Calendar, Trash2, Edit, X, Download, Target, CheckCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';

const FinanceDashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0],
    goalId: null
  });

  const [budgetForm, setBudgetForm] = useState({
    category: '',
    amount: ''
  });

  const [goalForm, setGoalForm] = useState({
    name: '',
    targetAmount: '',
    deadline: ''
  });

  const categories = {
    expense: ['Alimentación', 'Transporte', 'Vivienda', 'Entretenimiento', 'Salud', 'Educación', 'Ahorro', 'Otros'],
    income: ['Salario', 'Freelance', 'Inversiones', 'Regalos', 'Otros']
  };

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

  // Filtrar transacciones por mes seleccionado
  const filteredTransactions = transactions.filter(t => 
    t.date.startsWith(selectedMonth)
  );

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // Calcular ahorro total de todas las metas
  const totalSavings = transactions
    .filter(t => t.category === 'Ahorro')
    .reduce((sum, t) => sum + t.amount, 0);

  // Calcular ahorro del mes seleccionado
  const monthlySavings = filteredTransactions
    .filter(t => t.category === 'Ahorro')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense' && t.category !== 'Ahorro')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses - monthlySavings;

  // Calcular el progreso individual de cada meta
  const getGoalProgress = (goalId) => {
    const numGoalId = parseInt(goalId);
    return transactions
      .filter(t => t.category === 'Ahorro' && parseInt(t.goalId) === numGoalId)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Gastos por categoría del mes seleccionado (excluyendo Ahorro)
  const expensesByCategory = filteredTransactions
    .filter(t => t.type === 'expense' && t.category !== 'Ahorro')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  // Calcular alertas de presupuesto
  const budgetAlerts = Object.entries(expensesByCategory).map(([category, spent]) => {
    const budget = budgets[category] || 0;
    const percentage = budget > 0 ? (spent / budget) * 100 : 0;
    return {
      category,
      spent,
      budget,
      percentage,
      status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'ok'
    };
  }).filter(alert => alert.budget > 0);

  // Datos para gráficas
  const pieChartData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value
  }));

  const budgetComparisonData = Object.entries(budgets)
    .filter(([cat]) => categories.expense.includes(cat) && cat !== 'Ahorro')
    .map(([category, budget]) => ({
      category,
      presupuesto: budget,
      gastado: expensesByCategory[category] || 0
    }));

  // Datos de comparación Ingresos vs Gastos vs Ahorro
  const incomeVsExpensesData = [
    {
      name: 'Ingresos',
      monto: totalIncome
    },
    {
      name: 'Gastos',
      monto: totalExpenses
    },
    {
      name: 'Ahorro',
      monto: monthlySavings
    }
  ];

  // Datos históricos de últimos 6 meses
  const getMonthlyData = () => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toISOString().slice(0, 7);
      
      const monthTransactions = transactions.filter(t => t.date.startsWith(monthStr));
      const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expenses = monthTransactions.filter(t => t.type === 'expense' && t.category !== 'Ahorro').reduce((sum, t) => sum + t.amount, 0);
      const savings = monthTransactions.filter(t => t.category === 'Ahorro').reduce((sum, t) => sum + t.amount, 0);
      
      data.push({
        month: date.toLocaleDateString('es-ES', { month: 'short' }),
        ingresos: income,
        gastos: expenses,
        ahorro: savings
      });
    }
    return data;
  };

  const addTransaction = () => {
    if (!formData.description || !formData.amount || !formData.category) {
      alert('Por favor completa todos los campos');
      return;
    }

    if (formData.category === 'Ahorro' && !formData.goalId) {
      alert('Por favor selecciona una meta de ahorro');
      return;
    }

    if (editingId) {
      setTransactions(transactions.map(t => 
        t.id === editingId ? { 
          ...formData, 
          amount: parseFloat(formData.amount), 
          goalId: formData.goalId ? parseInt(formData.goalId) : null,
          id: editingId 
        } : t
      ));
      setEditingId(null);
    } else {
      const newTransaction = {
        ...formData,
        amount: parseFloat(formData.amount),
        goalId: formData.goalId ? parseInt(formData.goalId) : null,
        id: Date.now()
      };
      setTransactions([newTransaction, ...transactions]);
    }

    setFormData({
      description: '',
      amount: '',
      type: 'expense',
      category: '',
      date: new Date().toISOString().split('T')[0],
      goalId: null
    });
    setShowTransactionForm(false);
  };

  const addBudget = () => {
    if (!budgetForm.category || !budgetForm.amount) {
      alert('Por favor completa todos los campos');
      return;
    }

    setBudgets({
      ...budgets,
      [budgetForm.category]: parseFloat(budgetForm.amount)
    });

    setBudgetForm({ category: '', amount: '' });
    setShowBudgetModal(false);
  };

  const addGoal = () => {
    if (!goalForm.name || !goalForm.targetAmount || !goalForm.deadline) {
      alert('Por favor completa todos los campos');
      return;
    }

    const newGoal = {
      ...goalForm,
      targetAmount: parseFloat(goalForm.targetAmount),
      id: Date.now()
    };

    setSavingsGoals([...savingsGoals, newGoal]);
    setGoalForm({ name: '', targetAmount: '', deadline: '' });
  };

  const deleteGoal = (id) => {
    setSavingsGoals(savingsGoals.filter(g => g.id !== id));
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const editTransaction = (transaction) => {
    setFormData({
      description: transaction.description,
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: transaction.category,
      date: transaction.date,
      goalId: transaction.goalId || null
    });
    setEditingId(transaction.id);
    setShowTransactionForm(true);
  };

  const deleteBudget = (category) => {
    const newBudgets = { ...budgets };
    delete newBudgets[category];
    setBudgets(newBudgets);
  };

  const exportReport = () => {
    const reportData = {
      mes: selectedMonth,
      resumen: {
        ingresos: totalIncome,
        gastos: totalExpenses,
        ahorroMensual: monthlySavings,
        balance: balance,
        ahorroTotal: totalSavings
      },
      transacciones: filteredTransactions,
      gastosPorCategoria: expensesByCategory,
      presupuestos: budgets,
      metasDeAhorro: savingsGoals.map(g => ({
        ...g,
        ahorrado: getGoalProgress(g.id)
      }))
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `reporte_finanzas_${selectedMonth}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const exportToPDF = () => {
    const report = `
==============================================
    REPORTE FINANCIERO - ${selectedMonth}
==============================================

RESUMEN DEL MES:
- Ingresos: $${totalIncome.toLocaleString('es-CO')}
- Gastos: $${totalExpenses.toLocaleString('es-CO')}
- Ahorro del mes: $${monthlySavings.toLocaleString('es-CO')}
- Balance: $${balance.toLocaleString('es-CO')}
- Ahorro total acumulado: $${totalSavings.toLocaleString('es-CO')}

GASTOS POR CATEGORÍA:
${Object.entries(expensesByCategory).map(([cat, amount]) => 
  `- ${cat}: $${amount.toLocaleString('es-CO')}`
).join('\n')}

TRANSACCIONES DEL MES:
${filteredTransactions.map(t => 
  `${new Date(t.date).toLocaleDateString('es-ES')} - ${t.description} (${t.category}): ${t.type === 'income' ? '+' : '-'}$${t.amount.toLocaleString('es-CO')}`
).join('\n')}

METAS DE AHORRO:
${savingsGoals.map(g => {
  const goalSavings = getGoalProgress(g.id);
  const progress = (goalSavings / g.targetAmount * 100).toFixed(1);
  return `- ${g.name}: $${goalSavings.toLocaleString('es-CO')} / $${g.targetAmount.toLocaleString('es-CO')} (${progress}%)`;
}).join('\n')}

==============================================
Generado el ${new Date().toLocaleDateString('es-ES')}
    `;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_finanzas_${selectedMonth}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">💰 Dashboard de Finanzas</h1>
          <p className="text-gray-600">Control inteligente con alertas, presupuestos y metas de ahorro</p>
        </div>

        {/* Selector de Mes y Exportar */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="text-indigo-600" size={24} />
            <label className="font-semibold text-gray-700">Mes:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportReport}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2"
            >
              <Download size={18} />
              JSON
            </button>
            <button
              onClick={exportToPDF}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2"
            >
              <Download size={18} />
              TXT
            </button>
          </div>
        </div>

        {/* Alertas de Presupuesto */}
        {budgetAlerts.length > 0 && (
          <div className="mb-6 space-y-3">
            {budgetAlerts.map(alert => (
              alert.status !== 'ok' && (
                <div key={alert.category} className={`${alert.status === 'exceeded' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'} border-2 rounded-xl p-4 flex items-start gap-3`}>
                  <AlertTriangle className={alert.status === 'exceeded' ? 'text-red-600' : 'text-yellow-600'} size={24} />
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">
                      {alert.status === 'exceeded' ? '¡Presupuesto excedido!' : '⚠️ Alerta de presupuesto'}
                    </p>
                    <p className="text-gray-700">
                      <strong>{alert.category}:</strong> Has gastado ${alert.spent.toLocaleString('es-CO')} de ${alert.budget.toLocaleString('es-CO')} ({alert.percentage.toFixed(0)}%)
                    </p>
                  </div>
                </div>
              )
            ))}
          </div>
        )}

        {/* Cards de Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Ingresos</span>
              <TrendingUp size={24} />
            </div>
            <p className="text-3xl font-bold">${totalIncome.toLocaleString('es-CO')}</p>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Gastos</span>
              <TrendingDown size={24} />
            </div>
            <p className="text-3xl font-bold">${totalExpenses.toLocaleString('es-CO')}</p>
          </div>

          <div className={`bg-gradient-to-br ${balance >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} rounded-xl shadow-lg p-6 text-white`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Balance</span>
              <Wallet size={24} />
            </div>
            <p className="text-3xl font-bold">${balance.toLocaleString('es-CO')}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Ahorro Total</span>
              <Target size={24} />
            </div>
            <p className="text-3xl font-bold">${totalSavings.toLocaleString('es-CO')}</p>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => {
              setShowTransactionForm(!showTransactionForm);
              setEditingId(null);
              setFormData({
                description: '',
                amount: '',
                type: 'expense',
                category: '',
                date: new Date().toISOString().split('T')[0],
                goalId: null
              });
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2"
          >
            <PlusCircle size={20} />
            {showTransactionForm ? 'Cancelar' : 'Nueva Transacción'}
          </button>

          <button
            onClick={() => setShowBudgetModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2"
          >
            <DollarSign size={20} />
            Presupuestos
          </button>

          <button
            onClick={() => setShowGoalsModal(true)}
            className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2"
          >
            <Target size={20} />
            Metas de Ahorro
          </button>
        </div>

        {/* Formulario de Transacción */}
        {showTransactionForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingId ? 'Editar Transacción' : 'Nueva Transacción'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Descripción</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Ej: Supermercado"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Monto</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Tipo</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value, category: '', goalId: null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="expense">Gasto</option>
                  <option value="income">Ingreso</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Categoría</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value, goalId: null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Selecciona una categoría</option>
                  {categories[formData.type].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {formData.category === 'Ahorro' && savingsGoals.length > 0 && (
                                  <div>
                  <label className="block text-gray-700 font-medium mb-2">Meta de Ahorro</label>
                  <select
                    value={formData.goalId || ''}
                    onChange={(e) => setFormData({ ...formData, goalId: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Selecciona una meta</option>
                    {savingsGoals.map(goal => (
                      <option key={goal.id} value={goal.id}>{goal.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {formData.category === 'Ahorro' && savingsGoals.length === 0 && (
                <div className="col-span-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">⚠️ Primero debes crear una meta de ahorro</p>
                </div>
              )}

              <div>
                <label className="block text-gray-700 font-medium mb-2">Fecha</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={addTransaction}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all duration-200"
            >
              {editingId ? 'Actualizar' : 'Guardar Transacción'}
            </button>
          </div>
        )}

        {/* Modal de Presupuestos */}
        {showBudgetModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Configurar Presupuestos</h2>
                <button onClick={() => setShowBudgetModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Categoría</label>
                    <select
                      value={budgetForm.category}
                      onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Selecciona una categoría</option>
                      {categories.expense.filter(cat => cat !== 'Ahorro').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Presupuesto Mensual</label>
                    <input
                      type="number"
                      value={budgetForm.amount}
                      onChange={(e) => setBudgetForm({ ...budgetForm, amount: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                <button
                  onClick={addBudget}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all duration-200"
                >
                  Agregar Presupuesto
                </button>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-bold text-gray-800 mb-3">Presupuestos Configurados</h3>
                {Object.keys(budgets).length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No hay presupuestos configurados</p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(budgets).map(([category, amount]) => (
                      <div key={category} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-semibold text-gray-800">{category}</span>
                          <span className="text-gray-600 ml-2">${amount.toLocaleString('es-CO')}/mes</span>
                        </div>
                        <button
                          onClick={() => deleteBudget(category)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal de Metas de Ahorro */}
        {showGoalsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Metas de Ahorro</h2>
                <button onClick={() => setShowGoalsModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Nombre de la Meta</label>
                    <input
                      type="text"
                      value={goalForm.name}
                      onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                      placeholder="Ej: Vacaciones"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Meta ($)</label>
                    <input
                      type="number"
                      value={goalForm.targetAmount}
                      onChange={(e) => setGoalForm({ ...goalForm, targetAmount: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                      placeholder="0"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-gray-700 font-medium mb-2">Fecha límite</label>
                    <input
                      type="date"
                      value={goalForm.deadline}
                      onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>

                <button
                  onClick={addGoal}
                  className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all duration-200"
                >
                  Agregar Meta
                </button>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-bold text-gray-800 mb-3">Mis Metas</h3>
                {savingsGoals.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No tienes metas de ahorro configuradas</p>
                ) : (
                  <div className="space-y-4">
                    {savingsGoals.map(goal => {
                      const goalSavings = getGoalProgress(goal.id);
                      const progress = (goalSavings / goal.targetAmount) * 100;
                      const isCompleted = progress >= 100;
                      const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                      
                      return (
                        <div key={goal.id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-gray-800">{goal.name}</h4>
                                {isCompleted && <CheckCircle className="text-green-600" size={20} />}
                              </div>
                              <p className="text-sm text-gray-600">
                                Meta: ${goal.targetAmount.toLocaleString('es-CO')} • Fecha: {new Date(goal.deadline).toLocaleDateString('es-ES')}
                              </p>
                              <p className="text-sm text-gray-600">
                                {daysLeft > 0 ? `${daysLeft} días restantes` : 'Fecha límite alcanzada'}
                              </p>
                            </div>
                            <button
                              onClick={() => deleteGoal(goal.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                          
                          <div className="mb-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-700 font-medium">
                                ${goalSavings.toLocaleString('es-CO')} / ${goal.targetAmount.toLocaleString('es-CO')}
                              </span>
                              <span className={`font-bold ${isCompleted ? 'text-green-600' : 'text-gray-700'}`}>
                                {progress.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className={`h-3 rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-gradient-to-r from-pink-500 to-purple-500'}`}
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                          </div>
                          
                          <p className="text-xs text-gray-500 mt-2">
                            💡 Registra transacciones con categoría "Ahorro" y selecciona esta meta
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Gráficas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Gráfica de Comparación Ingresos vs Gastos vs Ahorro */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Ingresos vs Gastos vs Ahorro</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incomeVsExpensesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${value.toLocaleString('es-CO')}`} />
                <Bar dataKey="monto" fill="#8884d8">
                  {incomeVsExpensesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#ef4444' : '#8b5cf6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfica de Tendencia de Últimos 6 Meses */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Tendencia de Últimos 6 Meses</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getMonthlyData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `${value.toLocaleString('es-CO')}`} />
                <Legend />
                <Line type="monotone" dataKey="ingresos" stroke="#10b981" strokeWidth={2} name="Ingresos" />
                <Line type="monotone" dataKey="gastos" stroke="#ef4444" strokeWidth={2} name="Gastos" />
                <Line type="monotone" dataKey="ahorro" stroke="#8b5cf6" strokeWidth={2} name="Ahorro" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráficas Adicionales */}
        {pieChartData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Gráfica de Pastel */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Distribución de Gastos</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value.toLocaleString('es-CO')}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfica de Comparación con Presupuesto */}
            {budgetComparisonData.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Presupuesto vs Gastado</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={budgetComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value.toLocaleString('es-CO')}`} />
                    <Legend />
                    <Bar dataKey="presupuesto" fill="#8b5cf6" name="Presupuesto" />
                    <Bar dataKey="gastado" fill="#ef4444" name="Gastado" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Metas de Ahorro - Vista Rápida */}
        {savingsGoals.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Progreso de Metas de Ahorro</h2>
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <Target className="text-purple-600" size={32} />
                <div>
                  <p className="text-2xl font-bold text-purple-800">${totalSavings.toLocaleString('es-CO')}</p>
                  <p className="text-sm text-purple-600">Total Ahorrado</p>
                  <p className="text-xs text-gray-600 mt-1">💡 Agrega transacciones con categoría "Ahorro" para aumentar este monto</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savingsGoals.map(goal => {
                const goalSavings = getGoalProgress(goal.id);
                const progress = (goalSavings / goal.targetAmount) * 100;
                const isCompleted = progress >= 100;
                
                return (
                  <div key={goal.id} className={`p-4 rounded-lg border-2 ${isCompleted ? 'border-green-500 bg-green-50' : 'border-purple-200 bg-purple-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-800">{goal.name}</h4>
                      {isCompleted && <CheckCircle className="text-green-600" size={20} />}
                    </div>
                    <p className="text-2xl font-bold text-gray-800 mb-2">
                      ${goalSavings.toLocaleString('es-CO')}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      Meta: ${goal.targetAmount.toLocaleString('es-CO')}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-purple-500'}`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2 text-right">
                      {progress.toFixed(1)}%
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Lista de Transacciones */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Transacciones - {new Date(selectedMonth + '-15').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </h2>
          {filteredTransactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay transacciones en este mes</p>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map(transaction => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${transaction.type === 'income' ? 'bg-green-500' : transaction.category === 'Ahorro' ? 'bg-purple-500' : 'bg-red-500'}`} />
                      <div>
                        <p className="font-semibold text-gray-800">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {transaction.category}
                          {transaction.category === 'Ahorro' && transaction.goalId && (
                            <span className="ml-1 text-purple-600">
                              → {savingsGoals.find(g => parseInt(g.id) === parseInt(transaction.goalId))?.name || 'Meta eliminada'}
                            </span>
                          )}
                          {' • '}
                          {new Date(transaction.date).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-bold text-lg ${transaction.type === 'income' ? 'text-green-600' : transaction.category === 'Ahorro' ? 'text-purple-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString('es-CO')}
                    </span>
                    <button
                      onClick={() => editTransaction(transaction)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => deleteTransaction(transaction.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;