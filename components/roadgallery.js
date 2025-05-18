import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function RoadGallery({ passId }) {
  const [imageList, setImageList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const touchStartX = useRef(null);

  useEffect(() => {
    if (passId) reloadImages(passId);
  }, [passId]);

  const reloadImages = async (id) => {
    const { data: files } = await supabase.storage.from('pass-images').list(id);
    if (files?.length > 0) {
      const urls = files
        .filter(f => !f.name.includes('.pending') && f.name !== '.emptyFolderPlaceholder')
        .map(f => supabase.storage.from('pass-images').getPublicUrl(`${id}/${f.name}`).data.publicUrl);
      setImageList(urls);
    } else {
      setImageList([]);
    }
  };

  const handleFileChange = (e) => setFileToUpload(e.target.files[0]);

  const uploadImage = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) {
      alert('Bitte melde dich an, um ein Bild hochzuladen.');
      setUploading(false);
      return;
    }

    if (!fileToUpload || !passId) return;
    const filename = `${Date.now()}_${fileToUpload.name}`;
    setUploading(true);
    const { error } = await supabase.storage.from('pass-images').upload(`${passId}/${filename}`, fileToUpload);
    setUploading(false);
    if (!error) {
      alert('Bild erfolgreich hochgeladen.');
      setFileToUpload(null);
      reloadImages(passId);
    } else alert('Fehler beim Hochladen');
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxImage(imageList[index]);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  const nextImage = useCallback(() => {
    const next = (lightboxIndex + 1) % imageList.length;
    setLightboxIndex(next);
    setLightboxImage(imageList[next]);
  }, [lightboxIndex, imageList]);

  const prevImage = useCallback(() => {
    const prev = (lightboxIndex - 1 + imageList.length) % imageList.length;
    setLightboxIndex(prev);
    setLightboxImage(imageList[prev]);
  }, [lightboxIndex, imageList]);

  const handleTouchStart = (e) => (touchStartX.current = e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 50) (deltaX > 0 ? prevImage() : nextImage)();
    touchStartX.current = null;
  };

  const buttonStyle = {
    fontSize: 20,
    padding: '6px 10px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#fff',
    color: '#333',
    boxShadow: '0 0 8px rgba(0,0,0,0.2)',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
  };

  const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  const overlayStyle = {
    backgroundColor: isDarkMode ? '#000' : '#fff',
    color: isDarkMode ? '#fff' : '#000',
    border: `1px solid ${isDarkMode ? '#fff' : '#000'}`,
    padding: '30px 24px',
    borderRadius: 16,
    width: 340,
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    textAlign: 'center',
  };

  const uploadButtonStyle = {
    padding: '8px 16px',
    backgroundColor: isDarkMode ? '#000' : '#fff',
    color: isDarkMode ? '#fff' : '#000',
    border: `1px solid ${isDarkMode ? '#fff' : '#000'}`,
    borderRadius: 6,
    cursor: 'pointer',
  };

  const cancelButtonStyle = {
    padding: '8px 16px',
    backgroundColor: isDarkMode ? '#000' : '#fff',
    color: isDarkMode ? '#fff' : '#000',
    border: `1px solid ${isDarkMode ? '#fff' : '#000'}`,
    borderRadius: 6,
    cursor: 'pointer',
  };

  return (
    <div
      style={{
        position: 'relative',
        width: 180,
        height: 120,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#eee',
        cursor: 'pointer',
      }}
    >
      <div
        onClick={() => openLightbox(lightboxIndex)}
        style={{ width: '100%', height: '100%', position: 'relative' }}
        onMouseEnter={(e) => {
          const overlay = e.currentTarget.querySelector('.zoom-hint');
          if (overlay) overlay.style.opacity = 1;
        }}
        onMouseLeave={(e) => {
          const overlay = e.currentTarget.querySelector('.zoom-hint');
          if (overlay) overlay.style.opacity = 0;
        }}
      >
        {imageList.length > 0 ? (
          <>
            <img
              src={imageList[lightboxIndex]}
              alt="preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
              className="zoom-hint"
              style={{
                transition: 'opacity 0.3s',
                opacity: 0,
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: '#0008',
                color: '#fff',
                padding: '4px 8px',
                borderRadius: 6,
                fontSize: 14,
              }}
            >
              ⛶
            </div>
          </>
        ) : (
          <span style={{ display: 'block', textAlign: 'center', lineHeight: '120px' }}>📷</span>
        )}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          setUploading(true);
        }}
        style={{
          position: 'absolute',
          bottom: 4,
          right: 6,
          fontSize: 14,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
        }}
      >
        📤
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          alert('❤️');
        }}
        style={{
          position: 'absolute',
          bottom: 4,
          left: 6,
          fontSize: 14,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
        }}
      >
        ❤️
      </button>

      {uploading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99,
          }}
        >
          <div style={overlayStyle}>
            <h3 style={{ marginBottom: 16, fontSize: 18 }}>Bild hochladen</h3>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'block', margin: '0 auto 20px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <button onClick={uploadImage} style={uploadButtonStyle}>
                📤 Hochladen
              </button>
              <button onClick={() => setUploading(false)} style={cancelButtonStyle}>
                ❌ Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {lightboxImage && (
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: '#000c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '800px',
              height: '500px',
              backgroundColor: '#111',
              borderRadius: 16,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <img
              src={lightboxImage}
              alt="full"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12, boxShadow: '0 0 20px #000' }}
            />
          </div>
          <div style={{ position: 'absolute', bottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
            <button onClick={prevImage} style={buttonStyle}>
              ←
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeLightbox();
              }}
              style={buttonStyle}
            >
              ✕
            </button>
            <button onClick={nextImage} style={buttonStyle}>
              →
            </button>
            <button
              onClick={() => alert('❤️')}
              style={buttonStyle}
            >
              ❤️
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
