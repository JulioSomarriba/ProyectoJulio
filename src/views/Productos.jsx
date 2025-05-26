import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { db } from "../database/firebaseconfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import TablaProductos from "../components/productos/TablaProductos";
import ModalRegistroProducto from "../components/productos/ModalRegistroProducto";
import ModalEdicionProducto from "../components/productos/ModalEdicionProducto";
import ModalEliminacionProducto from "../components/productos/ModalEliminacionProducto";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import Paginacion from "../components/ordenamiento/Paginacion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const generarPDFDetalleProducto = (producto) => {
  const pdf = new jsPDF();

  pdf.setFillColor(28, 41, 51);
  pdf.rect(0, 0, 220, 30, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(22);
  pdf.text(producto.nombre, pdf.internal.pageSize.getWidth() / 2, 18, { align: "center" });

  const anchoPagina = pdf.internal.pageSize.getWidth();

  if (producto.imagen) {
    const propiedadesImagen = pdf.getImageProperties(producto.imagen);
    const anchoImagen = 60;
    const altoImagen = (propiedadesImagen.height * anchoImagen) / propiedadesImagen.width;
    const posicionX = (anchoPagina - anchoImagen) / 2;

    pdf.addImage(producto.imagen, 'JPEG', posicionX, 40, anchoImagen, altoImagen);

    const posicionY = 40 + altoImagen + 10;
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.text(`Precio: C$ ${producto.precio}`, anchoPagina / 2, posicionY, { align: "center" });
    pdf.text(`Categoría: ${producto.categoria}`, anchoPagina / 2, posicionY + 10, { align: "center" });
  } else {
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.text(`Precio: C$ ${producto.precio}`, anchoPagina / 2, 50, { align: "center" });
    pdf.text(`Categoría: ${producto.categoria}`, anchoPagina / 2, 60, { align: "center" });
  }

  pdf.save(`${producto.nombre}.pdf`);
};

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [nuevoProducto, setNuevoProducto] = useState({ nombre: "", precio: "", categoria: "", imagen: "" });
  const [productoEditado, setProductoEditado] = useState(null);
  const [productoAEliminar, setProductoAEliminar] = useState(null);

  const productosCollection = collection(db, "productos");
  const categoriasCollection = collection(db, "categorias");

  const fetchData = async () => {
    try {
      const productosData = await getDocs(productosCollection);
      const fetchedProductos = productosData.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setProductos(fetchedProductos);

      const categoriasData = await getDocs(categoriasCollection);
      const fetchedCategorias = categoriasData.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setCategorias(fetchedCategorias);
    } catch (error) {
      console.error("Error al obtener datos:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoProducto((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setProductoEditado((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNuevoProducto((prev) => ({ ...prev, imagen: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductoEditado((prev) => ({ ...prev, imagen: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    setCurrentPage(1);
  };

  const filteredProductos = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(searchText.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProductos = filteredProductos.slice(indexOfFirstItem, indexOfLastItem);

  const handleAddProducto = async () => {
    if (!nuevoProducto.nombre || !nuevoProducto.precio || !nuevoProducto.categoria) {
      alert("Por favor, completa todos los campos requeridos.");
      return;
    }
    try {
      await addDoc(productosCollection, nuevoProducto);
      setShowModal(false);
      setNuevoProducto({ nombre: "", precio: "", categoria: "", imagen: "" });
      await fetchData();
    } catch (error) {
      console.error("Error al agregar producto:", error);
    }
  };

  const handleEditProducto = async () => {
    if (!productoEditado.nombre || !productoEditado.precio || !productoEditado.categoria) {
      alert("Por favor, completa todos los campos requeridos.");
      return;
    }
    try {
      const productoRef = doc(db, "productos", productoEditado.id);
      await updateDoc(productoRef, productoEditado);
      setShowEditModal(false);
      await fetchData();
    } catch (error) {
      console.error("Error al actualizar producto:", error);
    }
  };

  const handleDeleteProducto = async () => {
    if (productoAEliminar) {
      try {
        const productoRef = doc(db, "productos", productoAEliminar.id);
        await deleteDoc(productoRef);
        setShowDeleteModal(false);
        await fetchData();
      } catch (error) {
        console.error("Error al eliminar producto:", error);
      }
    }
  };

  const openEditModal = (producto) => {
    setProductoEditado({ ...producto });
    setShowEditModal(true);
  };

  const openDeleteModal = (producto) => {
    setProductoAEliminar(producto);
    setShowDeleteModal(true);
  };

  const generarPDFProductos = () => {
    const doc = new jsPDF();
    doc.setFillColor(28, 41, 51);
    doc.rect(0, 0, 220, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.text("Lista de productos", doc.internal.pageSize.getWidth() / 2, 18, { align: "center" });

    const columnas = ["#", "Nombre", "Precio", "Categoria"];
    const filas = filteredProductos.map((producto, index) => [
      index + 1,
      producto.nombre,
      `C$ ${producto.precio}`,
      producto.categoria,
    ]);

    const totalPaginas = "{total_pages_count_string}";

    autoTable(doc, {
      head: [columnas],
      body: filas,
      startY: 40,
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 2 },
      margin: { top: 20, left: 14, right: 14 },
      tableWidth: "auto",
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 'auto' }
      },
      pageBreak: "auto",
      rowPageBreak: "auto",
      didDrawPage: function (data) {
        const alturaPagina = doc.internal.pageSize.getHeight();
        const anchoPagina = doc.internal.pageSize.getWidth();
        const numeroPagina = doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        const piePagina = `Página ${numeroPagina} de ${totalPaginas}`;
        doc.text(piePagina, anchoPagina / 2 + 15, alturaPagina - 10, { align: "center" });
      }
    });

    if (typeof doc.putTotalPages === 'function') {
      doc.putTotalPages(totalPaginas);
    }

    const fecha = new Date();
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    const nombreArchivo = `productos_${dia}${mes}${anio}.pdf`;

    doc.save(nombreArchivo);
  };

  return (
    <Container className="mt-5">
      <br />
      <h4>Gestión de Productos</h4>
      <Row>
        <Col lg={3} md={4} sm={6} xs={12}>
          <Button className="mb-3 w-100" onClick={() => setShowModal(true)}>
            Agregar producto
          </Button>
        </Col>
        <Col lg={3} md={4} sm={6} xs={12}>
          <Button
            className="mb-3"
            onClick={generarPDFProductos}
            variant="secondary"
            style={{ width: "100%" }}
          >
            Generar reporte PDF
          </Button>
        </Col>
      </Row>

      <CuadroBusquedas searchText={searchText} handleSearchChange={handleSearchChange} />

      <TablaProductos
        productos={currentProductos}
        openEditModal={openEditModal}
        openDeleteModal={openDeleteModal}
        generarPDFDetalleProducto={generarPDFDetalleProducto}
      />

      <Paginacion
        itemsPerPage={itemsPerPage}
        totalItems={filteredProductos.length}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <ModalRegistroProducto
        showModal={showModal}
        setShowModal={setShowModal}
        nuevoProducto={nuevoProducto}
        handleInputChange={handleInputChange}
        handleImageChange={handleImageChange}
        handleAddProducto={handleAddProducto}
        categorias={categorias}
      />

      <ModalEdicionProducto
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        productoEditado={productoEditado}
        handleEditInputChange={handleEditInputChange}
        handleEditImageChange={handleEditImageChange}
        handleEditProducto={handleEditProducto}
        categorias={categorias}
      />

      <ModalEliminacionProducto
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        handleDeleteProducto={handleDeleteProducto}
      />
    </Container>
  );
};

export default Productos;
