import pytest
from query_data import query_rag
from langchain_ollama import OllamaLLM
import re

# Define the evaluation prompt template
EVAL_PROMPT = """
Expected Response: {expected_response}
Actual Response: {actual_response}
---
Compare the actual response with the expected response. Consider numerical values and key information.
Answer with 'true' if they match semantically, or 'false' if they don't match.
Does the actual response match the expected response?
"""

def test_definisi_hukum_pidana():
    """
    Test case to validate the definition of criminal law.
    """
    assert query_and_validate(
        question="Apa definisi hukum pidana? (Jawab dalam satu kalimat)",
        expected_response="Hukum pidana adalah kumpulan aturan dan undang-undang yang mendefinisikan perilaku yang dilarang oleh pemerintah.",
    )

def test_sistem_peradilan_pidana():
    """
    Test case to validate the number of main components in the criminal justice system.
    """
    assert query_and_validate(
        question="Berapa komponen utama dalam sistem peradilan pidana? (Sebutkan angka saja)",
        expected_response="3",
    )

def test_jenis_hukuman_pidana():
    """
    Test case to validate the number of main types of criminal punishments.
    """
    assert query_and_validate(
        question="Berapa jenis utama hukuman pidana yang ada? (Sebutkan angka saja)",
        expected_response="4",
    )

def test_elemen_niat_pidana():
    """
    Test case to validate the number of elements that typically form criminal intent.
    """
    assert query_and_validate(
        question="Berapa elemen yang biasanya membentuk niat pidana? (Jawab dengan angka saja)",
        expected_response="2",
    )

def test_query_kosong():
    """
    Test case to ensure an empty query raises a ValueError.
    """
    with pytest.raises(ValueError):
        query_and_validate(question="", expected_response="jawaban apapun")

def test_format_jawaban_tidak_valid():
    """
    Test case to handle unexpected or invalid responses.
    """
    with pytest.raises(ValueError):
        query_and_validate(
            question="Pertanyaan tidak valid yang mungkin menghasilkan jawaban tidak terduga",
            expected_response="format yang diharapkan",
        )

def query_and_validate(question: str, expected_response: str):
    """
    Helper function to query the RAG system and validate the response against the expected response.

    Args:
        question (str): The question to query the RAG system.
        expected_response (str): The expected response to compare against.

    Returns:
        bool: True if the response matches the expected response, False otherwise.

    Raises:
        ValueError: If the question is empty, the response from the RAG system is empty, or the response is invalid.
    """
    # Validate the input question
    if not question.strip():
        raise ValueError("Pertanyaan tidak boleh kosong")

    # Query the RAG system
    response_text = query_rag(question)
    if not response_text.strip():
        raise ValueError("Menerima jawaban kosong dari sistem RAG")

    # Detect invalid responses
    if "tidak valid" in response_text.lower() or "pertanyaan tidak valid" in response_text.lower():
        raise ValueError("Pertanyaan tidak valid menghasilkan jawaban tidak terduga")

    # Extract numerical values from the response (if applicable)
    numbers_in_response = re.findall(r'\d+', response_text)
    if numbers_in_response:
        actual_response = numbers_in_response[0]  # Use the first number found
    else:
        actual_response = response_text.strip()

    # Format the evaluation prompt
    prompt = EVAL_PROMPT.format(
        expected_response=expected_response, actual_response=actual_response
    )

    # Use the Ollama LLM to evaluate the response
    try:
        model = OllamaLLM(model="aya:8B")  # Replace "mistral" with the installed model
        evaluation_results_str = model.invoke(prompt)
        evaluation_results_str_cleaned = evaluation_results_str.strip().lower()
    except Exception as e:
        raise RuntimeError(f"Gagal memanggil model Ollama: {str(e)}")

    # Print the evaluation prompt for debugging purposes
    print(prompt)

    # Determine the result based on the evaluation
    if "true" in evaluation_results_str_cleaned:
        # Print response in Green if it is correct
        print("\033[92m" + f"Response: {evaluation_results_str_cleaned}" + "\033[0m")
        return True
    elif "false" in evaluation_results_str_cleaned:
        # Print response in Red if it is incorrect
        print("\033[91m" + f"Response: {evaluation_results_str_cleaned}" + "\033[0m")
        return False
    else:
        raise ValueError(
            f"Hasil evaluasi tidak valid. Tidak dapat menentukan 'true' atau 'false'. Mendapat: {evaluation_results_str_cleaned}"
        )