import React, { useState, useEffect } from "react";
import { Container, Button, Alert, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { db, storage } from "../database/firebaseconfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import TablaLibros from "../components/libros/TablaLibros";
import ModalRegistroLibro from "../components/libros/ModalRegistroLibro";
import ModalEdicionLibro from "../components/libros/ModalEdicionLibro";
import ModalEliminacionLibro from "../components/libros/ModalEliminacionLibro";
import { useAuth } from "../database/authcontext";
import ModalQR from "../components/qr/ModalQR";

const Libros = () => {
  const [libros, setLibros] = useState([]);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [nuevoLibro, setNuevoLibro] = useState({
    nombre: "",
    autor: "",
    genero: "",
    pdfUrl: "",
  });
  const [libroEditado, setLibroEditado] = useState(null);
  const [libroAEliminar, setLibroAEliminar] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // Estado para el buscador

 //Metodos para el QR
 const openQRModal = (url) =>{
  setShowQRModal(url);
  setSelectedUrl("");
}
 
  const handleCloseQRModal = () => {
    setShowQRModal(false);
    selectedUrl("");
  }

  const handleCopy = (productos) =>{
    const rowData = `Nombre: ${productos.nombre}\nPrecio: C$${productos.precio}\nCategoria: ${productos.categoria}`;
    

    navigator.clipboard
    .writeText(rowData)
    .then(() =>{
      console.log("Error el copiar al portapapeles", err);
    });
  };

  

  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const librosCollection = collection(db, "libros");

  const fetchData = async () => {
    try {
      const librosData = await getDocs(librosCollection);
      const fetchedLibros = librosData.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setLibros(fetchedLibros);
    } catch (error) {
      console.error("Error al obtener datos:", error);
      setError("Error al cargar los datos. Intenta de nuevo.");
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      fetchData();
    }
  }, [isLoggedIn, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoLibro((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setLibroEditado((prev) => ({ ...prev, [name]: value }));
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    } else {
      alert("Por favor, selecciona un archivo PDF.");
    }
  };

  const handleEditPdfChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    } else {
      alert("Por favor, selecciona un archivo PDF.");
    }
  };

  const handleAddLibro = async () => {
    if (!isLoggedIn) {
      alert("Debes iniciar sesión para agregar un libro.");
      navigate("/login");
      return;
    }

    if (!nuevoLibro.nombre || !nuevoLibro.autor || !nuevoLibro.genero || !pdfFile) {
      alert("Por favor, completa todos los campos y selecciona un PDF.");
      return;
    }
    try {
      const storageRef = ref(storage, `libros/${pdfFile.name}`);
      await uploadBytes(storageRef, pdfFile);
      const pdfUrl = await getDownloadURL(storageRef);

      await addDoc(librosCollection, { ...nuevoLibro, pdfUrl });
      setShowModal(false);
      setNuevoLibro({ nombre: "", autor: "", genero: "", pdfUrl: "" });
      setPdfFile(null);
      await fetchData();
    } catch (error) {
      console.error("Error al agregar libro:", error);
      setError("Error al agregar el libro. Intenta de nuevo.");
    }
  };

  const handleEditLibro = async () => {
    if (!isLoggedIn) {
      alert("Debes iniciar sesión para editar un libro.");
      navigate("/login");
      return;
    }

    if (!libroEditado.nombre || !libroEditado.autor || !libroEditado.genero) {
      alert("Por favor, completa todos los campos requeridos.");
      return;
    }
    try {
      const libroRef = doc(db, "libros", libroEditado.id);
      if (pdfFile) {
        if (libroEditado.pdfUrl) {
          const oldPdfRef = ref(storage, libroEditado.pdfUrl);
          await deleteObject(oldPdfRef).catch((error) => {
            console.error("Error al eliminar el PDF anterior:", error);
          });
        }
        const storageRef = ref(storage, `libros/${pdfFile.name}`);
        await uploadBytes(storageRef, pdfFile);
        const newPdfUrl = await getDownloadURL(storageRef);
        await updateDoc(libroRef, { ...libroEditado, pdfUrl: newPdfUrl });
      } else {
        await updateDoc(libroRef, libroEditado);
      }
      setShowEditModal(false);
      setPdfFile(null);
      await fetchData();
    } catch (error) {
      console.error("Error al actualizar libro:", error);
      setError("Error al actualizar el libro. Intenta de nuevo.");
    }
  };

  const handleDeleteLibro = async () => {
    if (!isLoggedIn) {
      alert("Debes iniciar sesión para eliminar un libro.");
      navigate("/login");
      return;
    }

    if (libroAEliminar) {
      try {
        const libroRef = doc(db, "libros", libroAEliminar.id);
        if (libroAEliminar.pdfUrl) {
          const pdfRef = ref(storage, libroAEliminar.pdfUrl);
          await deleteObject(pdfRef).catch((error) => {
            console.error("Error al eliminar el PDF de Storage:", error);
          });
        }
        await deleteDoc(libroRef);
        setShowDeleteModal(false);
        await fetchData();
      } catch (error) {
        console.error("Error al eliminar libro:", error);
        setError("Error al eliminar el libro. Intenta de nuevo.");
      }
    }
  };

  const openEditModal = (libro) => {
    setLibroEditado({ ...libro });
    setShowEditModal(true);
  };

  const openDeleteModal = (libro) => {
    setLibroAEliminar(libro);
    setShowDeleteModal(true);
  };

  // Filtrar libros por nombre según la búsqueda
  const librosFiltrados = libros.filter((libro) =>
    libro.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container className="mt-5">
      <br />
      <h4>Gestión de Libros</h4>
      {error && <Alert variant="danger">{error}</Alert>}
      <Button className="mb-3" onClick={() => setShowModal(true)}>
        Agregar libro
      </Button>

      {/* Cuadro de búsqueda */}
      <Form.Control
        type="text"
        placeholder="Buscar por nombre..."
        className="mb-3"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <TablaLibros libros={librosFiltrados} openEditModal={openEditModal} openDeleteModal={openDeleteModal} />
      
      <ModalRegistroLibro {...{ showModal, setShowModal, nuevoLibro, handleInputChange, handlePdfChange, handleAddLibro }} />
      <ModalEdicionLibro {...{ showEditModal, setShowEditModal, libroEditado, handleEditInputChange, handleEditPdfChange, handleEditLibro }} />
      <ModalEliminacionLibro {...{ showDeleteModal, setShowDeleteModal, handleDeleteLibro }} />
      <ModalQR
      show={showQRModal}
      handleClose={handleCloseQRModal}
      qrUrl={selectedUrl}
       />
    </Container>
  );
};

export default Libros;
