import { useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

// Bozor uchun mos emojilar to'plami
const EMOJI_GROUPS = [
  {
    name: 'Meva-sabzavot',
    emojis: ['🍎', '🍊', '🍋', '🍇', '🍓', '🍑', '🍒', '🥝', '🍌', '🍉', '🍍', '🥭', '🥑', '🥦', '🥕', '🌽', '🧅', '🥔', '🍠', '🥬', '🍄', '🌶️', '🥒', '🧄'],
  },
  {
    name: 'Go\'sht-sut mahsulotlari',
    emojis: ['🥩', '🍗', '🥚', '🧀', '🥛', '🧈', '🥓', '🍖', '🦴', '🐟', '🦐', '🦀', '🐔', '🐄', '🐑', '🐖', '🐪', '🦆'],
  },
  {
    name: 'Non-qandolat',
    emojis: ['🍞', '🥖', '🥨', '🧇', '🥞', '🥐', '🍩', '🍪', '🍰', '🧁', '🍦', '🍫', '🍬', '🍭', '🍯', '🎂'],
  },
  {
    name: 'Ichimliklar',
    emojis: ['🧃', '🥤', '🍵', '☕', '🧊', '🍺', '🥂', '🍷', '🥃', '🍸', '🧉', '🧋', '🍶', '🍾', '🥛'],
  },
  {
    name: 'Kiyim-kechak',
    emojis: ['👗', '👕', '👖', '🧥', '🧤', '🧣', '👟', '👠', '👡', '👢', '👞', '🧦', '👜', '👛', '💼', '🎒', '👝', '🧳', '👑', '🧢', '🎩'],
  },
  {
    name: 'Texnika',
    emojis: ['📱', '💻', '🖥️', '⌨️', '🖨️', '📷', '📹', '🎥', '📺', '📻', '🔊', '🔋', '💡', '🔦', '⌚', '📀', '🎮', '🕹️', '📞'],
  },
  {
    name: 'Uy-ro\'zg\'or',
    emojis: ['🛋️', '🛏️', '🚿', '🪞', '🪑', '🪟', '🚪', '🧹', '🧺', '🧼', '🪣', '🪠', '🔑', '🪒', '💈', '🛁', '🚽', '🧴', '🕯️'],
  },
  {
    name: 'Qurilish-ta\'mirlash',
    emojis: ['🔨', '🪚', '🪛', '🔧', '🔩', '⚙️', '🔗', '📏', '📐', '🧰', '🪜', '🪟', '🪚', '🪛'],
  },
  {
    name: 'Bog\'Tokar',
    emojis: ['🌳', '🌲', '🌵', '🌿', '☘️', '🍀', '🌸', '🌺', '🌻', '🌹', '🌷', '💐', '🌾', '🌱', '🪴', '🌴', '🍂', '🍁'],
  },
  {
    name: 'Transport',
    emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚜', '🛵', '🚲', '🛴', '🛻', '🚚', '🚛', '✈️', '🚂', '⛵'],
  },
  {
    name: 'Sport-hobbi',
    emojis: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥊', '🥋', '🎯', '🎳', '⛳', '🎿', '🛹', '🏋️', '🤸', '🧘'],
  },
  {
    name: 'Boshqa',
    emojis: ['📦', '🎁', '💎', '💍', '⌚', '📿', '💊', '💉', '🩹', '🧬', '🔬', '🔭', '📚', '✏️', '🖊️', '📋', '📌', '🧷', '🧸', '🎀', '🏆', '🥇'],
  },
];

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
  onClose: () => void;
}

export default function EmojiPicker({ value, onChange, onClose }: EmojiPickerProps) {
  const [search, setSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState('');

  const allEmojis = EMOJI_GROUPS.flatMap(g => g.emojis);
  const filtered = search
    ? allEmojis
    : activeGroup
      ? EMOJI_GROUPS.find(g => g.name === activeGroup)?.emojis || allEmojis
      : allEmojis;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[80vh] shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-dark-900 flex items-center gap-2">
              <span>🏷️</span> Ikonka tanlang
            </h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <FiX className="w-5 h-5 text-dark-400" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Qidirish..."
              className="input-field pl-9 py-2 text-sm w-full rounded-xl bg-gray-50"
              autoFocus
            />
          </div>

          {/* Selected emoji preview */}
          {value && (
            <div className="mt-2 flex items-center gap-2 text-sm text-dark-500">
              <span>Tanlangan:</span>
              <span className="text-2xl">{value}</span>
            </div>
          )}
        </div>

        {/* Group tabs */}
        {!search && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar px-5 py-3 border-b border-gray-50">
            <button
              onClick={() => setActiveGroup('')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                !activeGroup
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-gray-100 text-dark-500 hover:bg-gray-200'
              }`}
            >
              Hammasi
            </button>
            {EMOJI_GROUPS.map((group) => (
              <button
                key={group.name}
                onClick={() => setActiveGroup(group.name)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  activeGroup === group.name
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-gray-100 text-dark-500 hover:bg-gray-200'
                }`}
              >
                {group.name}
              </button>
            ))}
          </div>
        )}

        {/* Emoji grid */}
        <div className="p-5 overflow-y-auto max-h-[50vh]">
          <div className="grid grid-cols-7 sm:grid-cols-8 gap-1">
            {filtered.map((emoji, i) => (
              <button
                key={i}
                onClick={() => onChange(emoji)}
                className={`w-full aspect-square rounded-xl text-2xl flex items-center justify-center transition-all hover:scale-110 hover:bg-primary-50 hover:shadow-sm
                  ${value === emoji ? 'bg-primary-100 ring-2 ring-primary-400 scale-110 shadow-md' : 'bg-gray-50'}
                `}
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-8 text-dark-400 text-sm">Emoji topilmadi</div>
          )}
        </div>
      </div>
    </div>
  );
}
