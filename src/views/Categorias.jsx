import React, { useState, useEffect } from "react";
import { Container, Button } from "react-bootstrap";
import { db } from "../database/firebaseconfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

// Componentes personalizados
import TablaCategorias from "../components/Categorias/CategoriasTabla";
import ModalRegistroCategoria from "../components/Categorias/ModalRegistroCategoria";
import ModalEdicionCategoria from "../components/Categorias/ModalEdicionCategoria";
import ModalEliminacionCategoria from "../components/Categorias/ModalEliminacionCategoria";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import Paginacion from "../components/ordenamiento/Paginacion"; 
import ChatIA from "../components/chat/ChatIA";

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [nuevaCategoria, setNuevaCategoria] = useState({
    nombre: "",
    descripcion: "",
  });

  const [categoriaEditada, setCategoriaEditada] = useState(null);
  const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);

  const categoriasCollection = collection(db, "categorias");

  const fetchCategorias = async () => {
    try {
      const data = await getDocs(categoriasCollection);
      const fetchedCategorias = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setCategorias(fetchedCategorias);
    } catch (error) {
      console.error("Error al obtener las categorías:", error);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    setCurrentPage(1); // Reinicia a la página 1 cuando buscas
  };

  // Filtrado + paginación
  const filteredCategorias = categorias.filter((categoria) =>
    categoria.nombre.toLowerCase().includes(searchText.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategorias = filteredCategorias.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  return (
    <Container className="mt-5">
      <h4>Gestión de Categorías</h4>

      <CuadroBusquedas
        searchText={searchText}
        handleSearchChange={handleSearchChange}
      />

      <Button className="mb-3" onClick={() => setShowModal(true)}>
        Agregar categoría
      </Button>

      <Button className="mb-3" onClick={() => setShowChatModal(true)} style={{ width: "100%" }}>
        Chat IA
      </Button>

      <TablaCategorias
        categorias={currentCategorias}
        openEditModal={(categoria) => {
          setCategoriaEditada(categoria);
          setShowEditModal(true);
        }}
        openDeleteModal={(categoria) => {
          setCategoriaAEliminar(categoria);
          setShowDeleteModal(true);
        }}
      />

      {/* Paginación debajo de la tabla */}
      <Paginacion
        itemsPerPage={itemsPerPage}
        totalItems={filteredCategorias.length}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      {/* MODAL AGREGAR */}
      <ModalRegistroCategoria
        showModal={showModal}
        setShowModal={setShowModal}
        nuevaCategoria={nuevaCategoria}
        handleInputChange={(e) =>
          setNuevaCategoria({
            ...nuevaCategoria,
            [e.target.name]: e.target.value,
          })
        }
        handleAddCategoria={async () => {
          if (!nuevaCategoria.nombre || !nuevaCategoria.descripcion) {
            alert("Por favor, completa todos los campos antes de guardar.");
            return;
          }
          try {
            await addDoc(categoriasCollection, nuevaCategoria);
            setShowModal(false);
            setNuevaCategoria({ nombre: "", descripcion: "" });
            await fetchCategorias();
          } catch (error) {
            console.error("Error al agregar la categoría:", error);
          }
        }}
      />

      {/* MODAL EDITAR */}
      <ModalEdicionCategoria
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        categoriaEditada={categoriaEditada}
        handleEditInputChange={(e) =>
          setCategoriaEditada({
            ...categoriaEditada,
            [e.target.name]: e.target.value,
          })
        }
        handleEditCategoria={async () => {
          if (!categoriaEditada.nombre || !categoriaEditada.descripcion) {
            alert("Por favor, completa todos los campos antes de actualizar.");
            return;
          }
          try {
            await updateDoc(doc(db, "categorias", categoriaEditada.id), {
              nombre: categoriaEditada.nombre,
              descripcion: categoriaEditada.descripcion,
            });
            setShowEditModal(false);
            await fetchCategorias();
          } catch (error) {
            console.error("Error al actualizar la categoría:", error);
          }
        }}
      />

      {/* MODAL ELIMINAR */}
      <ModalEliminacionCategoria
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        handleDeleteCategoria={async () => {
          if (categoriaAEliminar) {
            try {
              await deleteDoc(doc(db, "categorias", categoriaAEliminar.id));
              setShowDeleteModal(false);
              await fetchCategorias();
            } catch (error) {
              console.error("Error al eliminar la categoría:", error);
            }
          }
        }}
      />
       <ChatIA showChatModal={showChatModal} setShowChatModal={setShowChatModal} />
    </Container>
  );
};

export default Categorias;
