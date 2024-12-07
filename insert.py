import sys
import json
from PyQt5.QtWidgets import (
    QApplication,
    QWidget,
    QVBoxLayout,
    QFormLayout,
    QLineEdit,
    QTextEdit,
    QPushButton,
    QMessageBox,
    QLabel,
)
from PyQt5.QtGui import QFont, QColor, QPalette
from PyQt5.QtCore import Qt
import html

class NoteUploader(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Upload Note")
        self.setGeometry(100, 100, 600, 400)
        self.initUI()

    def initUI(self):
        # Apply dark theme
        self.set_dark_theme()

        # Layouts
        self.layout = QVBoxLayout()
        self.form_layout = QFormLayout()

        # Font setup
        label_font = QFont("Arial", 12, QFont.Bold)
        input_font = QFont("Arial", 11)

        # Input fields
        self.title_label = QLabel("Title:")
        self.title_label.setFont(label_font)
        self.title_input = QLineEdit()
        self.title_input.setFont(input_font)

        self.content_label = QLabel("Content:")
        self.content_label.setFont(label_font)
        self.content_input = QTextEdit()
        self.content_input.setFont(input_font)

        self.keywords_label = QLabel("Keywords (comma-separated):")
        self.keywords_label.setFont(label_font)
        self.keywords_input = QLineEdit()
        self.keywords_input.setFont(input_font)

        self.category_label = QLabel("Category:")
        self.category_label.setFont(label_font)
        self.category_input = QLineEdit()
        self.category_input.setFont(input_font)

        # Add fields to form layout
        self.form_layout.addRow(self.title_label, self.title_input)
        self.form_layout.addRow(self.content_label, self.content_input)
        self.form_layout.addRow(self.keywords_label, self.keywords_input)
        self.form_layout.addRow(self.category_label, self.category_input)

        # Add button
        self.submit_button = QPushButton("Insert Notes into JSON")
        self.submit_button.setFont(QFont("Arial", 12, QFont.Bold))
        self.submit_button.setStyleSheet(
            "background-color: #4CAF50; color: white; padding: 8px; border-radius: 5px;"
        )
        self.submit_button.clicked.connect(self.insert_note)

        # Add form and button to main layout
        self.layout.addLayout(self.form_layout)
        self.layout.addWidget(self.submit_button, alignment=Qt.AlignCenter)

        # Set the main layout
        self.setLayout(self.layout)

    def set_dark_theme(self):
        dark_palette = QPalette()

        # Set palette colors
        dark_palette.setColor(QPalette.Window, QColor(45, 45, 45))
        dark_palette.setColor(QPalette.WindowText, QColor(220, 220, 220))
        dark_palette.setColor(QPalette.Base, QColor(30, 30, 30))
        dark_palette.setColor(QPalette.AlternateBase, QColor(45, 45, 45))
        dark_palette.setColor(QPalette.ToolTipBase, QColor(220, 220, 220))
        dark_palette.setColor(QPalette.ToolTipText, QColor(220, 220, 220))
        dark_palette.setColor(QPalette.Text, QColor(220, 220, 220))
        dark_palette.setColor(QPalette.Button, QColor(70, 70, 70))
        dark_palette.setColor(QPalette.ButtonText, QColor(220, 220, 220))
        dark_palette.setColor(QPalette.BrightText, QColor(255, 0, 0))
        dark_palette.setColor(QPalette.Highlight, QColor(100, 100, 220))
        dark_palette.setColor(QPalette.HighlightedText, QColor(220, 220, 220))

        # Apply the palette to the app
        self.setPalette(dark_palette)

        # Set global style
        self.setStyleSheet(
            """
            QWidget {
                font-family: Arial;
                font-size: 12px;
                color: #E0E0E0;
            }
            QLineEdit, QTextEdit {
                background-color: #303030;
                color: #E0E0E0;
                border: 1px solid #505050;
                border-radius: 4px;
                padding: 4px;
            }
            QLabel {
                color: #E0E0E0;
            }
            """
        )

    def insert_note(self):
        try:
            # Read the existing JSON file
            try:
                with open("notes.json", "r") as file:
                    notes = json.load(file)
            except FileNotFoundError:
                notes = []

            # Create a new note
            new_id = notes[-1]["id"] + 1 if notes else 1
            new_note = {
                "id": new_id,
                "title": self.title_input.text(),
                "content": html.escape(self.content_input.toPlainText()),  # Escape for HTML compatibility
                "keywords": [kw.strip() for kw in self.keywords_input.text().split(",")],
                "category": self.category_input.text(),
            }

            # Append the new note to the list
            notes.append(new_note)

            # Write back to the JSON file
            with open("notes.json", "w") as file:
                json.dump(notes, file, indent=2)

            # Show success message
            QMessageBox.information(self, "Success", "Note added successfully!")
            
            # Clear input fields
            self.title_input.clear()
            self.content_input.clear()
            self.keywords_input.clear()
            self.category_input.clear()

        except Exception as e:
            QMessageBox.critical(self, "Error", f"Failed to insert note: {e}")

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = NoteUploader()
    window.show()
    sys.exit(app.exec_())
