import { createContext, useContext, useState, useEffect } from "react";
import { getCatalogByName } from "@/services/catalog.service";

const CatalogContext = createContext();

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export function CatalogProvider({ children }) {
  const [catalogs, setCatalogs] = useState({
    genres: [],
    ageClassifications: [],
    lifecycleStates: [],
    projectionTypes: [],
    isLoaded: false
  });

  useEffect(() => {
    async function initMasterData() {
      try {
        // Al cargarse la app por primera vez, pedimos los catálogos en Fila India (Secuencial).
        // Esto le da tiempo al pool de conexiones de Render de abrir y cerrar cada consulta limpiamente.
        const genres = await getCatalogByName("genres");
        await delay(200); 

        const ageClassifications = await getCatalogByName("age-classifications");
        await delay(200);

        const lifecycleStates = await getCatalogByName("movie-lifecycle-states");
        await delay(200);

        const projectionTypes = await getCatalogByName("projection-types");

        setCatalogs({
          genres,
          ageClassifications,
          lifecycleStates,
          projectionTypes,
          isLoaded: true
        });
      } catch (error) {
        console.error("Error inicializando catálogos globales:", error);
      }
    }

    initMasterData();
  }, []);

  return (
    <CatalogContext.Provider value={catalogs}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalogs() {
  return useContext(CatalogContext);
}