from langchain_ollama import OllamaEmbeddings  # Updated import for OllamaEmbeddings

def get_embedding_function():
    """
    Returns an instance of the OllamaEmbeddings class configured with the specified model.
    """
    return OllamaEmbeddings(model="nomic-embed-text")