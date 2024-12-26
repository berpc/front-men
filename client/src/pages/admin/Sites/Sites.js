import React, { useState, useEffect } from "react";
import { Tab, Button, Icon } from "semantic-ui-react";
import { BasicModal } from "../../../components/Shared";
import { SiteForm, ListSites } from "../../../components/Admin/Sites";
import "./Sites.scss";
import { useAuth } from "../../../hooks";
import { isAdmin, hasPermission, isMaster } from "../../../utils/checkPermission";
import { ErrorAccessDenied } from "../Error";
import { Permission } from "../../../api";
import { Link } from 'react-router-dom';
import { useLanguage } from "../../../contexts";


const permissionController = new Permission();

export function Sites() {
  const [showModal, setShowModal] = useState(false);
  const [reload, setReload] = useState(false);
  const {
    accessToken,
    user: { role },
  } = useAuth();

  const [permissionsByRole, setPermissionsByRole] = useState([]);
  const onOpenCloseModal = () => setShowModal((prevState) => !prevState);
  const onReload = () => setReload((prevState) => !prevState);

  const { language, changeLanguage, translations } = useLanguage();
  
  const t = (key) => translations[key] || key ; // Función para obtener la traducción

  useEffect(() => {
    (async () => {
      try {
        setPermissionsByRole([]);
        if (role) {
          const response = await permissionController.getPermissionsByRole(
            accessToken,
            role._id,
            true
          );
          setPermissionsByRole(response);
        }
      } catch (error) {
        console.error(error);
        setPermissionsByRole([]);
      }
    })();
  }, [role]);

  const panes = [
    {
      menuItem: t("active_sites"),
      render: () => (
        <Tab.Pane attached={false}>
          <ListSites sitesActive={true} reload={reload} onReload={onReload} />
        </Tab.Pane>
      ),
    },
    {
      menuItem: t("inactive_sites"),
      render: () => (
        <Tab.Pane attached={false}>
          <ListSites sitesActive={false} reload={reload} onReload={onReload} />
        </Tab.Pane>
      ),
    },
  ];

  if (
    isMaster(role) || isAdmin(role) ||
    hasPermission(permissionsByRole, role._id, "sites", "view")
  ) {
    return (
      <>
        <div className="sites-page">
          { isMaster(role) ||isAdmin(role) ||
          hasPermission(permissionsByRole, role._id, "sites", "create") ? (
             <Button
               className="sites-page__add"
              primary
              onClick={onOpenCloseModal}
             >
              <Icon name='plus' /> {t("new_site")}
             </Button>
           
          ) : null}
          <Tab menu={{ secondary: true }} panes={panes} />
        </div>

        <BasicModal
          show={showModal}
          close={onOpenCloseModal}
          title={t("create_new_site")}
        >
          <SiteForm close={onOpenCloseModal} onReload={onReload} />
        </BasicModal>
      </>
    );
  } else {
    return <ErrorAccessDenied />;
  }
}
