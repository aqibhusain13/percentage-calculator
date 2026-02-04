
import React, { useState, useCallback, useMemo } from 'react';
import { 
  Calculator, 
  History as HistoryIcon, 
  Sparkles, 
  Percent, 
  TrendingUp, 
  Minus, 
  Plus, 
  RefreshCcw,
  ArrowRight,
  Info
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell as ReCell 
} from 'recharts';
import { CalcType, HistoryItem, AIAnalysis } from './types';
import { analyzeWordProblem } from './services/geminiService';

const App: React.FC = () => {
  const [calcType, setCalcType] = useState<CalcType>('BASIC_OF');
  const [inputs, setInputs] = useState<string[]>(['', '']);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  // Logic for calculations
  const result = useMemo(() => {
    const num1 = parseFloat(inputs[0]);
    const num2 = parseFloat(inputs[1]);

    if (isNaN(num1) || isNaN(num2)) return null;

    switch (calcType) {
      case 'BASIC_OF':
        return (num1 / 100) * num2;
      case 'IS_WHAT':
        return (num1 / num2) * 100;
      case 'CHANGE':
        return ((num2 - num1) / Math.abs(num1)) * 100;
      case 'ADD_SUB':
        return num2 + ((num1 / 100) * num2);
      default:
        return null;
    }
  }, [calcType, inputs]);

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const saveToHistory = useCallback(() => {
    if (result === null) return;
    const item: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      type: calcType,
      inputs: inputs.map(v => parseFloat(v)),
      result: result,
      label: calcType === 'BASIC_OF' ? `${inputs[0]}% of ${inputs[1]}` :
             calcType === 'IS_WHAT' ? `${inputs[0]} is what % of ${inputs[1]}` :
             calcType === 'CHANGE' ? `Change from ${inputs[0]} to ${inputs[1]}` :
             `${inputs[0]}% added to ${inputs[1]}`
    };
    setHistory(prev => [item, ...prev].slice(0, 10));
  }, [result, calcType, inputs]);

  const handleAiSolve = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    try {
      const analysis = await analyzeWordProblem(aiInput);
      setCalcType(analysis.type);
      setInputs(analysis.inputs.map(i => i.toString()));
      setAiInput('');
    } catch (err) {
      console.error(err);
      alert("AI couldn't process this problem. Try clarifying the numbers.");
    } finally {
      setAiLoading(false);
    }
  };

  const chartData = useMemo(() => {
    if (result === null) return [];
    const num1 = parseFloat(inputs[0]) || 0;
    const num2 = parseFloat(inputs[1]) || 0;

    if (calcType === 'BASIC_OF') {
      return [
        { name: 'Result', value: result, color: '#3b82f6' },
        { name: 'Remaining', value: Math.max(0, num2 - result), color: '#e2e8f0' }
      ];
    }
    if (calcType === 'IS_WHAT') {
      return [
        { name: 'Portion', value: Math.min(100, result), color: '#10b981' },
        { name: 'Rest', value: Math.max(0, 100 - result), color: '#e2e8f0' }
      ];
    }
    return [];
  }, [result, calcType, inputs]);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Percent size={24} strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Percento</h1>
          </div>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
          >
            <HistoryIcon size={20} className="text-gray-600" />
            {history.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-8 grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Calculator */}
        <div className="md:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <Calculator size={18} className="text-blue-500" />
              Calculator
            </h2>

            {/* Type Selector */}
            <div className="grid grid-cols-2 gap-2 mb-8">
              {(['BASIC_OF', 'IS_WHAT', 'CHANGE', 'ADD_SUB'] as CalcType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setCalcType(type);
                    setInputs(['', '']);
                  }}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    calcType === type 
                      ? 'bg-blue-50 text-blue-700 border-2 border-blue-500 shadow-sm' 
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {type === 'BASIC_OF' && 'What is X% of Y?'}
                  {type === 'IS_WHAT' && 'X is what % of Y?'}
                  {type === 'CHANGE' && '% Change'}
                  {type === 'ADD_SUB' && 'Add % to Value'}
                </button>
              ))}
            </div>

            {/* Input Fields */}
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 text-gray-700 font-medium">
                {calcType === 'BASIC_OF' && (
                  <>
                    <div className="w-full flex-1">
                      <label className="block text-xs uppercase text-gray-400 mb-1">Percentage (%)</label>
                      <input 
                        type="number" value={inputs[0]} onChange={e => handleInputChange(0, e.target.value)}
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                        placeholder="e.g. 25"
                      />
                    </div>
                    <span className="mt-4 md:mt-0 text-gray-400">% of</span>
                    <div className="w-full flex-1">
                      <label className="block text-xs uppercase text-gray-400 mb-1">Total Value</label>
                      <input 
                        type="number" value={inputs[1]} onChange={e => handleInputChange(1, e.target.value)}
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                        placeholder="e.g. 200"
                      />
                    </div>
                  </>
                )}

                {calcType === 'IS_WHAT' && (
                  <>
                    <div className="w-full flex-1">
                      <label className="block text-xs uppercase text-gray-400 mb-1">Part Value</label>
                      <input 
                        type="number" value={inputs[0]} onChange={e => handleInputChange(0, e.target.value)}
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                        placeholder="e.g. 50"
                      />
                    </div>
                    <span className="mt-4 md:mt-0 text-gray-400">is what % of</span>
                    <div className="w-full flex-1">
                      <label className="block text-xs uppercase text-gray-400 mb-1">Total Value</label>
                      <input 
                        type="number" value={inputs[1]} onChange={e => handleInputChange(1, e.target.value)}
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                        placeholder="e.g. 200"
                      />
                    </div>
                  </>
                )}

                {calcType === 'CHANGE' && (
                  <>
                    <div className="w-full flex-1">
                      <label className="block text-xs uppercase text-gray-400 mb-1">Original Value</label>
                      <input 
                        type="number" value={inputs[0]} onChange={e => handleInputChange(0, e.target.value)}
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                        placeholder="e.g. 100"
                      />
                    </div>
                    <span className="mt-4 md:mt-0 text-gray-400">to</span>
                    <div className="w-full flex-1">
                      <label className="block text-xs uppercase text-gray-400 mb-1">New Value</label>
                      <input 
                        type="number" value={inputs[1]} onChange={e => handleInputChange(1, e.target.value)}
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                        placeholder="e.g. 150"
                      />
                    </div>
                  </>
                )}

                {calcType === 'ADD_SUB' && (
                  <>
                    <div className="w-full flex-1">
                      <label className="block text-xs uppercase text-gray-400 mb-1">Percent (%)</label>
                      <input 
                        type="number" value={inputs[0]} onChange={e => handleInputChange(0, e.target.value)}
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                        placeholder="e.g. 10"
                      />
                    </div>
                    <span className="mt-4 md:mt-0 text-gray-400">% applied to</span>
                    <div className="w-full flex-1">
                      <label className="block text-xs uppercase text-gray-400 mb-1">Value</label>
                      <input 
                        type="number" value={inputs[1]} onChange={e => handleInputChange(1, e.target.value)}
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                        placeholder="e.g. 1000"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Result Area */}
              {result !== null && (
                <div className="mt-8 pt-8 border-t border-gray-100 text-center">
                  <div className="text-sm font-medium text-gray-400 uppercase mb-2">Calculated Result</div>
                  <div className="text-5xl font-black text-blue-600 mb-4 tracking-tighter">
                    {calcType === 'IS_WHAT' || calcType === 'CHANGE' 
                      ? `${result.toLocaleString(undefined, { maximumFractionDigits: 2 })}%`
                      : result.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                  <div className="flex justify-center gap-3">
                    <button 
                      onClick={saveToHistory}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                    >
                      <Plus size={16} /> Save to History
                    </button>
                    <button 
                      onClick={() => setInputs(['', ''])}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                    >
                      <RefreshCcw size={16} /> Reset
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Helper Section */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles size={20} className="text-yellow-300" />
              AI Assistant
            </h2>
            <p className="text-sm text-indigo-100 mb-4">Paste a word problem and I'll figure out the calculation for you.</p>
            <div className="relative">
              <textarea 
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                placeholder="Ex: I bought a shirt for $40 but it was 15% off. What was the original price?"
                className="w-full p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl placeholder-indigo-200 text-white outline-none focus:ring-2 focus:ring-white/50 min-h-[100px]"
              />
              <button 
                onClick={handleAiSolve}
                disabled={aiLoading || !aiInput.trim()}
                className={`absolute bottom-3 right-3 px-4 py-2 bg-white text-indigo-600 rounded-lg font-bold shadow-sm transition-transform active:scale-95 disabled:opacity-50 flex items-center gap-2`}
              >
                {aiLoading ? <RefreshCcw className="animate-spin" size={18} /> : 'Solve with AI'}
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Visualization & History */}
        <div className="md:col-span-5 space-y-6">
          {/* Visualizer */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-6 text-gray-800 flex items-center gap-2">
              <TrendingUp size={18} className="text-green-500" />
              Visualization
            </h2>
            
            <div className="h-64 flex items-center justify-center">
              {result === null ? (
                <div className="text-center text-gray-400">
                  <Info size={40} className="mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Enter numbers to see visual data</p>
                </div>
              ) : (
                <div className="w-full h-full">
                  {(calcType === 'BASIC_OF' || calcType === 'IS_WHAT') && chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : calcType === 'CHANGE' ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Old', value: parseFloat(inputs[0]) },
                        { name: 'New', value: parseFloat(inputs[1]) }
                      ]}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          <ReCell fill="#94a3b8" />
                          <ReCell fill={result >= 0 ? '#10b981' : '#ef4444'} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center text-gray-400">
                      <p className="text-sm">Adding {inputs[0]}% to {inputs[1]}</p>
                      <div className="mt-4 flex items-center justify-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">{inputs[1]}</div>
                        <Plus className="text-blue-500" />
                        <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center font-bold text-blue-600">{result}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {result !== null && (
               <div className="mt-4 text-center text-xs text-gray-400 italic">
                Formula used: {
                  calcType === 'BASIC_OF' ? `(${inputs[0]} / 100) * ${inputs[1]}` :
                  calcType === 'IS_WHAT' ? `(${inputs[0]} / ${inputs[1]}) * 100` :
                  calcType === 'CHANGE' ? `((${inputs[1]} - ${inputs[0]}) / ${inputs[0]}) * 100` :
                  `${inputs[1]} + ((${inputs[0]} / 100) * ${inputs[1]})`
                }
               </div>
            )}
          </div>

          {/* Local History */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Recent Calculations</h3>
              <button onClick={() => setHistory([])} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Clear All</button>
            </div>
            <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto">
              {history.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">No recent items</div>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => {
                    setCalcType(item.type);
                    setInputs(item.inputs.map(i => i.toString()));
                  }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-400 uppercase">{item.type.replace('_', ' ')}</p>
                        <p className="text-sm font-semibold text-gray-700">{item.label}</p>
                      </div>
                      <div className="text-lg font-bold text-blue-600">
                        {item.type === 'IS_WHAT' || item.type === 'CHANGE' ? `${item.result.toFixed(2)}%` : item.result.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer / Info */}
      <footer className="mt-20 border-t border-gray-100 py-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-400 mb-2">&copy; 2024 Percento Suite. Built with Gemini AI.</p>
          <div className="flex justify-center gap-4">
            <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors"><Info size={18} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
