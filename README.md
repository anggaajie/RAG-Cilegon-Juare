# RAG Cilegon Juare

A Flask-based web application for document question-answering using Retrieval-Augmented Generation (RAG) with PDF documents. The application allows users to upload PDF files and ask questions about their content, leveraging Large Language Models (LLMs) and vector database for accurate responses.

## Features

- PDF document upload and processing with automatic text extraction
- Efficient vector database storage using Chroma for fast similarity search
- Advanced question-answering using RAG architecture with LangChain integration
- Responsive web-based user interface with real-time chat functionality
- Docker support for easy deployment and scalability
- Automatic document chunking and embedding generation
- Support for multiple PDF documents
- Built-in error handling and validation

## Prerequisites

- Python 3.10 or higher
- Docker and Docker Compose (for containerized deployment)
- Ollama for local LLM support

## Installation

### Local Development

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd RAG-Cilegon-Juare
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv myenv
   source myenv/bin/activate  # On Windows: myenv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up Ollama:
   - Install Ollama following the instructions at https://ollama.ai
   - Pull the required model: `ollama pull mistral`

### Docker Deployment

1. Build and run using Docker Compose:
   ```bash
   docker-compose up --build
   ```

## Usage

1. Start the application:
   - Local: `python app.py`
   - Docker: Application starts automatically

2. Access the web interface at `http://localhost:5000`

3. Upload PDF documents through the web interface
   - Click the "Upload" button
   - Select PDF files (up to 50MB each)
   - Wait for processing confirmation

4. Ask questions about the uploaded documents
   - Type your question in the chat interface
   - View the list of uploaded documents
   - Receive AI-powered responses based on document content

## Project Structure

- `app.py`: Main Flask application
- `populate_database.py`: Database population script
- `query_data.py`: RAG query handling
- `get_embedding_function.py`: Embedding function configuration
- `data/`: PDF document storage
- `chroma/`: Vector database storage
- `templates/`: HTML templates
- `static/`: Static assets (CSS, JavaScript)
- `test_rag.py`: Test suite for RAG functionality

## Configuration

- Maximum file size: 50MB
- Supported file type: PDF
- Environment variables can be configured in `docker-compose.yml`
- Default server port: 5000

## Testing

Run the test suite using pytest:

```bash
pytest
```

For coverage report:

```bash
pytest --cov=. tests/
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- LangChain for the RAG implementation
- Chroma for vector storage
- Ollama for local LLM support
