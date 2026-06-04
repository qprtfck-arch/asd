import streamlit as st

st.set_page_config(page_title="StudyBridge", page_icon="🎓", layout="wide")

# Hide Streamlit chrome and redirect to static HTML
st.markdown("""
    <style>
        .stApp > header { display: none !important; }
        .block-container { padding: 0 !important; }
        footer { display: none !important; }
        [data-testid="stToolbar"] { display: none !important; }
    </style>
    <script>
        window.location.replace('/app/static/index.html');
    </script>
""", unsafe_allow_html=True)

st.markdown("### Загрузка StudyBridge...")
