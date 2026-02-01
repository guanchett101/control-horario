import localforage from 'localforage';

// Configurar localforage para usar IndexedDB (más robusto que localStorage en Chrome móvil)
localforage.config({
  driver: [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE],
  name: 'ControlHorarios',
  version: 1.0,
  storeName: 'auth',
  description: 'Almacenamiento de autenticación'
});

// API compatible con localStorage pero usando IndexedDB
export const storage = {
  async setItem(key, value) {
    try {
      await localforage.setItem(key, value);
      // También guardar en localStorage como backup
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.warn('localStorage no disponible, usando solo IndexedDB');
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      throw error;
    }
  },

  async getItem(key) {
    try {
      // Intentar primero con IndexedDB
      let value = await localforage.getItem(key);
      
      // Si no hay en IndexedDB, intentar localStorage
      if (!value) {
        try {
          value = localStorage.getItem(key);
          // Si encontramos en localStorage, sincronizar a IndexedDB
          if (value) {
            await localforage.setItem(key, value);
          }
        } catch (e) {
          console.warn('localStorage no disponible');
        }
      }
      
      return value;
    } catch (error) {
      console.error('Error al leer:', error);
      return null;
    }
  },

  async removeItem(key) {
    try {
      await localforage.removeItem(key);
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn('localStorage no disponible');
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  },

  async clear() {
    try {
      await localforage.clear();
      try {
        localStorage.clear();
      } catch (e) {
        console.warn('localStorage no disponible');
      }
    } catch (error) {
      console.error('Error al limpiar:', error);
    }
  }
};

export default storage;
