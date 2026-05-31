import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  seller_id: string;
  seller_name: string;
  slug: string;
}

interface AppState {
  telegramId: number | null;
  user: any;
  seller: any;
  isSeller: boolean;
  isAdmin: boolean;
  isTgReady: boolean;
  token: string | null;

  // Cart (local + sync)
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;

  // Favorites (local)
  favoriteIds: string[];
  favoriteProducts: any[];

  // Actions
  initTg: () => void;
  setUser: (user: any) => void;
  setSeller: (seller: any) => void;
  setIsSeller: (val: boolean) => void;
  setIsAdmin: (val: boolean) => void;
  setToken: (token: string | null) => void;
  setTelegramId: (id: number | null) => void;

  // Cart actions
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setCart: (items: CartItem[]) => void;

  // Favorite actions
  toggleFavorite: (productId: string, productData?: any) => void;
  isFavorite: (productId: string) => boolean;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      telegramId: null,
      user: null,
      seller: null,
      isSeller: false,
      isAdmin: false,
      isTgReady: false,
      token: null,
      cart: [],
      cartCount: 0,
      cartTotal: 0,
      favoriteIds: [],
      favoriteProducts: [],

      initTg: () => {
        try {
          const tg = (window as any)?.Telegram?.WebApp;
          if (tg) {
            tg.ready();
            tg.expand();

            const initData = tg.initDataUnsafe;
            const user = initData?.user;

            if (user?.id) {
              set({
                telegramId: user.id,
                isTgReady: true,
              });
            }
          }

          // Also check URL params (for development)
          const params = new URLSearchParams(window.location.search);
          const urlUser = params.get('user');
          if (urlUser && !get().telegramId) {
            set({ telegramId: parseInt(urlUser), isTgReady: true });
          }
        } catch (e) {
          console.log('Not in Telegram WebApp');
          // Dev mode fallback
          const params = new URLSearchParams(window.location.search);
          const urlUser = params.get('user');
          if (urlUser) {
            set({ telegramId: parseInt(urlUser), isTgReady: true });
          }
        }
      },

      setUser: (user) => set({ user, telegramId: user?.telegram_id ?? null }),
      setSeller: (seller) => set({ seller }),
      setIsSeller: (isSeller) => set({ isSeller }),
      setIsAdmin: (isAdmin) => set({ isAdmin }),
      setToken: (token) => set({ token }),
      setTelegramId: (id) => set({ telegramId: id }),

      addToCart: (item) => {
        const state = get();
        const existing = state.cart.find((i) => i.product_id === item.product_id);

        let newCart: CartItem[];
        if (existing) {
          newCart = state.cart.map((i) =>
            i.product_id === item.product_id
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          );
        } else {
          newCart = [...state.cart, item];
        }

        set({
          cart: newCart,
          cartCount: newCart.reduce((sum, i) => sum + i.quantity, 0),
          cartTotal: newCart.reduce((sum, i) => sum + i.price * i.quantity, 0),
        });
      },

      removeFromCart: (productId) => {
        const state = get();
        const newCart = state.cart.filter((i) => i.product_id !== productId);
        set({
          cart: newCart,
          cartCount: newCart.reduce((sum, i) => sum + i.quantity, 0),
          cartTotal: newCart.reduce((sum, i) => sum + i.price * i.quantity, 0),
        });
      },

      updateCartQuantity: (productId, quantity) => {
        const state = get();
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }

        const newCart = state.cart.map((i) =>
          i.product_id === productId ? { ...i, quantity } : i
        );

        set({
          cart: newCart,
          cartCount: newCart.reduce((sum, i) => sum + i.quantity, 0),
          cartTotal: newCart.reduce((sum, i) => sum + i.price * i.quantity, 0),
        });
      },

      clearCart: () => set({ cart: [], cartCount: 0, cartTotal: 0 }),

      toggleFavorite: (productId, productData) => {
        const state = get();
        const exists = state.favoriteIds.includes(productId);
        set({
          favoriteIds: exists
            ? state.favoriteIds.filter((id) => id !== productId)
            : [...state.favoriteIds, productId],
          favoriteProducts: exists
            ? state.favoriteProducts.filter((p: any) => p.id !== productId)
            : productData
              ? [...state.favoriteProducts, productData]
              : state.favoriteProducts,
        });
      },

      isFavorite: (productId) => get().favoriteIds.includes(productId),

      setCart: (items) =>
        set({
          cart: items,
          cartCount: items.reduce((sum, i) => sum + i.quantity, 0),
          cartTotal: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
        }),
    }),
      {
        name: 'kattaqurgon-cart',
        partialize: (state) => ({
          token: state.token,
          telegramId: state.telegramId,
          cart: state.cart,
          cartCount: state.cartCount,
          cartTotal: state.cartTotal,
          favoriteIds: state.favoriteIds,
          favoriteProducts: state.favoriteProducts,
        }),
      }

  )
);
