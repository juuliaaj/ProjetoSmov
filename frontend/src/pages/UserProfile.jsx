import styles from './UserProfile.module.css';
import Header from "../components/Header";
import Footer from "../components/Footer";
import usePermissions from "../hooks/usePermissions";

import { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';

import { User, Mail, Phone, Edit, Save, X, Trash2, Camera } from "lucide-react";

import { IMaskInput } from "react-imask";

import { toast, ToastContainer } from "react-toastify";
import { TOAST_CONFIG } from "../utils/toast";

import fetcher from '../utils/fetcher';
import supabase from '../utils/supabase';

const UserProfile = () => {
  const [permissions] = usePermissions();
  const [isEditing, setIsEditing] = useState(false);

  const [userId, setUserId] = useState(null); 
  const [userData, setUserData] = useState({
    nome: '',
    email: '',
    telefone: '',
    bio: '',
    foto_perfil: '',
    admin: false,
  });

  const [editedData, setEditedData] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const params = useParams();

  useEffect(() => {
    if (!params) return;

    const userId = params.id;

    fetcher.get('/usuarios', { params: { id: userId } })
      .then((response) => {
        const data = response.data.data;

        if (!data) {
          console.error('Erro ao carregar as informações do usuário');

          return;
        }

        setUserId(data.id_usuario);

        setUserData({
          nome: data.nome,
          email: data.email ?? '',
          telefone: data.telefone ?? '',
          bio: data.bio ?? '',
          foto_perfil: data.foto_perfil ?? '',
          admin: data.admin ?? false,
        })
      })
      .catch((err) => {
        console.log(err);
      });
  }, [params]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData(userData);
  };

  const handleSave = async () => {
    const editData = { ...editedData };
    
    if (profileFile) {
      const { url, path } = await uploadFile(profileFile);

      editData.foto_perfil = url;
      editData.foto_perfil_path = path;
    }

    fetcher.put('/usuarios', editData)
      .then(() => {
        setUserData(editedData);
        setIsEditing(false);

        toast.success("Perfil atualizado com sucesso!", TOAST_CONFIG);
      })
      .catch((err) => {
        console.error(err);

        toast.error('Ocorreu um erro ao tentar salvar o perfil.', TOAST_CONFIG)
      });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(null);
    setPreviewImage(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      setProfileFile(file);

      const reader = new FileReader();

      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };

      reader.readAsDataURL(file);
    }
  };

  const uploadFile = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `usuarios/${fileName}`;
    
    const { error } = await supabase.storage
      .from('smov')
      .upload(filePath, file);
    
    if (error) throw error;
    
    const { data: urlData } = supabase.storage
      .from('smov')
      .getPublicUrl(filePath);
    
    return { path: filePath, url: urlData.publicUrl};
  };

  const handleDeleteAccount = () => {
    toast.error("Funcionalidade de exclusão será implementada em breve", TOAST_CONFIG);
  };

  return (
    <>
      <Header permissions={permissions} />

      <div className={styles.userProfile__grid}>
        <div className={styles.userProfile__sidebar}>
          <div className={styles.userProfile__sidebarContent}>
            <div className={styles.userProfile__avatarWrapper}>
              <div className={styles.userProfile__avatar}>
                {(previewImage || userData.foto_perfil) ? (
                  <img
                    src={previewImage || userData.foto_perfil}
                    alt={userData.nome}
                    className={styles.userProfile__avatarImage}
                  />
                ) : (
                  <div className={styles.userProfile__avatarPlaceholder}>
                    {String(userData.nome).split(' ').map((s) => s[0]).join('')}
                  </div>
                )}
                
              </div>

              {isEditing && (
                <label className={styles.userProfile__avatarEdit}>
                  <Camera className={styles.userProfile__avatarIcon} />
                  <input
                    type="file"
                    accept="image/*"
                    className={styles.userProfile__fileInput}
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>

            <div className={styles.userProfile__nameSection}>
              {isEditing ? (
                <div className={styles.userProfile__inputGroup}>
                  <label htmlFor="nome" className={styles.userProfile__label}>Nome Completo</label>
                  <input
                    id="nome"
                    type="text"
                    value={editedData.nome}
                    onChange={(e) => setEditedData({ ...editedData, nome: e.target.value })}
                    className={styles.userProfile__input}
                  />
                </div>
              ) : (
                <h2 className={styles.userProfile__name}>{userData.nome}</h2>
              )}
            </div>

            <div className={styles.userProfile__pills}>
              {userData.admin && (
                <span className={styles.userProfile__pill + ' ' + styles['userProfile__pill--admin']}>
                  Admin
                </span>
              )}
            </div>

            {permissions && permissions.id_usuario === userId && (
              <div className={styles.userProfile__actions}>
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className={styles.userProfile__btn + ' ' + styles['userProfile__btn--primary']}
                  >
                    <Edit className={styles.userProfile__btnIcon} />
                    Editar Perfil
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      className={styles.userProfile__btn + ' ' + styles['userProfile__btn--success']}
                    >
                      <Save className={styles.userProfile__btnIcon} />
                      Salvar Alterações
                    </button>
                    <button
                      onClick={handleCancel}
                      className={styles.userProfile__btn + ' ' + styles['userProfile__btn--outline']}
                    >
                      <X className={styles.userProfile__btnIcon} />
                      Cancelar
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={styles.userProfile__content}>
          <div className={styles.userProfile__section}>
            <h3 className={styles.userProfile__sectionTitle}>
              <User className={styles.userProfile__sectionIcon} />
              Informações de Contato
            </h3>
            <div className={styles.userProfile__fields}>
              <div className={styles.userProfile__field}>
                <label htmlFor="email" className={styles.userProfile__fieldLabel}>
                  <Mail className={styles.userProfile__fieldIcon} />
                  Email
                </label>
                {isEditing ? (
                  <input
                    id="email"
                    type="email"
                    value={editedData.email}
                    onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                    className={styles.userProfile__input}
                    placeholder="seu@email.com"
                  />
                ) : (
                  <p className={styles.userProfile__fieldValue}>{userData.email || 'Não informado'}</p>
                )}
              </div>

              <div className={styles.userProfile__field}>
                <label htmlFor="telefone" className={styles.userProfile__fieldLabel}>
                  <Phone className={styles.userProfile__fieldIcon} />
                  Telefone / WhatsApp
                </label>
                {isEditing ? (
                  <IMaskInput
                    type="tel"
                    id="telefone"
                    name="telefone"
                    value={editedData.telefone}
                    onAccept={(value) => setEditedData({ ...editedData, telefone: value })}
                    required
                    mask="(00) 00000-0000"
                    unmask={true}
                    placeholder="(00) 00000-0000"
                    className={styles.userProfile__input}
                  />
                ) : (
                  <p className={styles.userProfile__fieldValue}>{userData.telefone ? String(userData.telefone).replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3") : 'Não informado'}</p>
                )}
              </div>
            </div>
          </div>

          {(!!userData.bio || isEditing) && (
            <div className={styles.userProfile__section}>
              <h3 className={styles.userProfile__sectionTitle}>Sobre Mim</h3>
              {isEditing ? (
                <textarea
                  value={editedData.bio}
                  onChange={(e) => setEditedData({ ...editedData, bio: e.target.value })}
                  className={styles.userProfile__textarea}
                  placeholder="Conte um pouco sobre você e suas motivações..."
                  rows="5"
                />
              ) : (
                <p className={styles.userProfile__bio}>
                  {userData.bio}
                </p>
              )}
            </div>
          )}

          {isEditing && !isEditing && (
            <button
              onClick={handleDeleteAccount}
              className={styles.userProfile__btn + ' ' + styles['userProfile__btn--danger']}
            >
              <Trash2 className={styles.userProfile__btnIcon} />
              Excluir Conta
            </button>
          )}
        </div>
      </div>

      <Footer />
      <ToastContainer />
    </>
  );
};

export default UserProfile;

