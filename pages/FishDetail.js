// Handle fish deletion
const handleDelete = async () => {
  if (!window.confirm('Are you sure you want to delete this fish? This action cannot be undone.')) {
    return;
  }
  
  try {
    setDeleting(true);
    await axios.delete(`/api/fish/${id}`);
    toast.success('Fish deleted successfully');
    navigate('/dashboard');
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to delete fish');
    setDeleting(false);
  }
}; 