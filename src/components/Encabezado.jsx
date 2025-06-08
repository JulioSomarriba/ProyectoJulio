import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Offcanvas from "react-bootstrap/Offcanvas";
import { useAuth } from "../database/authcontext";
import logo from "../assets/ferreteria_selva_logo.png";
import 'bootstrap-icons/font/bootstrap-icons.css';
import "../App.css";
import { useTranslation } from 'react-i18next';
import { NavDropdown } from "react-bootstrap";

const Encabezado = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isLoggedIn, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const cambiarIdioma = (lang) => {
    i18n.changeLanguage(lang);
  };

  const handleLogout = async () => {
    try {
      setIsCollapsed(false);
      localStorage.removeItem("adminEmail");
      localStorage.removeItem("adminPassword");
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleToggle = () => setIsCollapsed(!isCollapsed);

  const handleNavigate = (path) => {
    navigate(path);
    setIsCollapsed(false);
  };

  return (
    <Navbar expand="sm" fixed="top" className="color-navbar">
      <Container>
        <Navbar.Brand
          onClick={() => handleNavigate("/inicio")}
          className="text-white"
          style={{ cursor: "pointer" }}
        >
          <img alt="" src={logo} width="30" height="30" className="d-inline-block align-top" />{" "}
          <strong>{t("Proyecto Julio")}</strong>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="offcanvasNavbar-expand-sm" onClick={handleToggle} />

        <Navbar.Offcanvas
          id="offcanvasNavbar-expand-sm"
          aria-labelledby="offcanvasNavbarLabel-expand-sm"
          placement="end"
          show={isCollapsed}
          onHide={() => setIsCollapsed(false)}
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title
              id="offcanvasNavbarLabel-expand-sm"
              className={isCollapsed ? "color-texto-marca" : "text-white"}
            >
              {t("menu.tituloMenu")}
            </Offcanvas.Title>
          </Offcanvas.Header>

          <Offcanvas.Body>
            <Nav className="justify-content-end flex-grow-1 pe-3">
              <Nav.Link
                onClick={() => handleNavigate("/inicio")}
                className={isCollapsed ? "color-texto-marca" : "text-white"}
              >
                {isCollapsed && <i className="bi-house-door-fill me-2"></i>}
                <strong>{t("menu.inicio")}</strong>
              </Nav.Link>

              <Nav.Link onClick={() => handleNavigate("/categorias")} className="text-white">
                {t("menu.categorias")}
              </Nav.Link>

              <Nav.Link onClick={() => handleNavigate("/productos")} className="text-white">
                {t("menu.productos")}
              </Nav.Link>

              <Nav.Link onClick={() => handleNavigate("/libros")} className="text-white">
                {t("menu.libros")}
              </Nav.Link>

              <Nav.Link onClick={() => handleNavigate("/catalogos")} className="text-white">
                {t("Catalogos")}
              </Nav.Link>

              <Nav.Link onClick={() => handleNavigate("/pronunciacion")} className="text-white">
                {t("menu.pronunciacion")}
              </Nav.Link>

               <Nav.Link
                onClick={() => handleNavigate("/empleados")}
                className={isCollapsed ? "color-texto-marca" : "text-white"}
              >
                {isCollapsed ? <i className="bi-cloud-sun-fill me-2"></i> : null}
                <strong>{t("empleados")}</strong>

              </Nav.Link>

              <Nav.Link
                onClick={() => handleNavigate("/clima")}
                className={isCollapsed ? "color-texto-marca" : "text-white"}
              >
                {isCollapsed && <i className="bi-cloud-sun-fill me-2"></i>}
                <strong>{t("menu.clima")}</strong>
              </Nav.Link>

              <Nav.Link onClick={() => handleNavigate("/estadisticas")} className="text-white">
                {t("menu.estadisticas")}
              </Nav.Link>

              {isLoggedIn ? (
                <Nav.Link onClick={handleLogout} className="text-white">
                  {t("menu.cerrarSesion")}
                </Nav.Link>
              ) : location.pathname === "/" && (
                <Nav.Link onClick={() => handleNavigate("/")} className="text-white">
                  {t("menu.iniciarSesion")}
                </Nav.Link>
              )}

              <NavDropdown
                title={
                  <span>
                    <i className="bi-translate me-2"></i>
                    {isCollapsed && <span>{t("menu.idioma")}</span>}
                  </span>
                }
                id="basic-nav-dropdown"
                className={isCollapsed ? "color-texto-marca" : "texto-blanco"}
              >
                <NavDropdown.Item onClick={() => cambiarIdioma("es")} className="text-black">
                  <strong>{t("menu.español")}</strong>
                </NavDropdown.Item>
                <NavDropdown.Item onClick={() => cambiarIdioma("en")} className="text-black">
                  <strong>{t("menu.ingles")}</strong>
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
};

export default Encabezado;
