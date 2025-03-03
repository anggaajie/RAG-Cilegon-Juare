import argparse
from langchain_chroma import Chroma  # Updated import for Chroma
from langchain.prompts import ChatPromptTemplate
from langchain_ollama import OllamaLLM  # Updated import for Ollama
from get_embedding_function import get_embedding_function

# Define constants
CHROMA_PATH = "chroma"  # Path to the Chroma database
PROMPT_TEMPLATE = """
Answer the question based only on the following context:
{context}
---
Answer the question based on the above context: {question}
"""

def main():
    """
    Main function to handle CLI arguments and query the RAG system.
    """
    # Create CLI parser
    parser = argparse.ArgumentParser(description="Query the Chroma database using RAG.")
    parser.add_argument("query_text", type=str, help="The query text to search in the database.")
    args = parser.parse_args()
    query_text = args.query_text
    query_rag(query_text)

def query_rag(query_text: str):
    """
    Query the RAG system using the provided query text.
    
    Args:
        query_text (str): The query text to search in the database.
    """
    # Prepare the Chroma database
    embedding_function = get_embedding_function()
    db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embedding_function)
    
    # Search the database for similar documents
    results = db.similarity_search_with_score(query_text, k=5)  # Retrieve top 5 results
    context_text = "\n\n---\n\n".join([doc.page_content for doc, _score in results])
    
    # Prepare the prompt template
    prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
    prompt = prompt_template.format(context=context_text, question=query_text)
    
    # Use the Ollama LLM to generate a response
    model = OllamaLLM(model="llama3.2:1B")  # Updated class name for Ollama
    response_text = model.invoke(prompt)
    
    # Extract sources from the retrieved documents
    sources = [doc.metadata.get("id", None) for doc, _score in results]
    
    # Format and print the response
    formatted_response = f"Response: {response_text}\nSources: {sources}"
    print(formatted_response)
    return response_text

if __name__ == "__main__":
    main()