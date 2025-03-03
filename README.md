# RAG Cilegon Juare

A Flask-based web application for document question-answering using Retrieval-Augmented Generation (RAG) with PDF documents. The application allows users to upload PDF files and ask questions about their content, leveraging LLMs and vector database for accurate responses.

## Features

- PDF document upload and processing
- Vector database storage using Chroma
- Question-answering using RAG architecture
- Web-based user interface
- Docker support for easy deployment

## Prerequisites

- Python 3.10 or higher
- Docker and Docker Compose (for containerized deployment)

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

4. Ask questions about the uploaded documents

## Project Structure

- `app.py`: Main Flask application
- `populate_database.py`: Database population script
- `query_data.py`: RAG query handling
- `get_embedding_function.py`: Embedding function configuration
- `data/`: PDF document storage
- `chroma/`: Vector database storage
- `templates/`: HTML templates
- `static/`: Static assets (CSS, JavaScript)

## Configuration

- Maximum file size: 50MB
- Supported file type: PDF
- Environment variables can be configured in `docker-compose.yml`

## License

This project is licensed under the MIT License - see the LICENSE file for details.