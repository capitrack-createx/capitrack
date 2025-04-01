// Common styles used across components
export const styles = {
    // Layout
    container: {
      background: 'white',
      borderRadius: '8px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'
    },
    title: {
      fontSize: '18px',
      fontWeight: 500
    },
  
    // Forms
    form: {
      marginBottom: '24px',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px'
    },
    input: {
      padding: '8px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      width: '100%'
    },
    select: {
      padding: '8px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      width: '100%'
    },
    button: {
      padding: '8px 16px',
      background: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    
    // Grid and Lists
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '16px'
    },
    card: {
      padding: '16px',
      border: '1px solid #ddd',
      borderRadius: '4px'
    },
  
    // Text styles
    label: {
      fontSize: '14px',
      fontWeight: 500,
      color: '#374151'
    },
    text: {
      fontSize: '14px',
      color: '#666'
    },
    boldText: {
      fontWeight: 500
    },
  
    // Modal
    modal: {
      position: 'fixed' as const,
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    },
    modalContent: {
      background: 'white',
      borderRadius: '8px',
      padding: '24px',
      width: '100%',
      maxWidth: '400px'
    },
    modalButtons: {
      display: 'flex',
      gap: '8px',
      marginTop: '16px'
    },
    cancelButton: {
      padding: '8px 16px',
      background: '#f3f4f6',
      color: '#374151',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    }
  } 