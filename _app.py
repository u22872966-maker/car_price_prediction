# app.py
git add requirements.txt
git commit -m "Fix Python 3.13 compatibility"
git push
import streamlit as st
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import r2_score, mean_absolute_error
import plotly.express as px

# Set page configuration
st.set_page_config(page_title="Car Price Prediction", layout="wide")

st.title("🚗 Car Price Prediction Dashboard")
st.markdown("Predict car prices based on features")

class CarPriceDashboard:
    def __init__(self):
        self.df = self.create_sample_data()
        self.train_model()
    
    def create_sample_data(self):
        np.random.seed(42)
        n_samples = 500
        
        data = {
            'Make': np.random.choice(['Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes', 'Audi'], n_samples),
            'Type': np.random.choice(['Sedan', 'SUV', 'Truck', 'Coupe'], n_samples),
            'Origin': np.random.choice(['Asia', 'Europe', 'USA'], n_samples),
            'DriveTrain': np.random.choice(['Front', 'Rear', 'All'], n_samples),
            'EngineSize': np.round(np.random.uniform(1.6, 6.0, n_samples), 1),
            'Cylinders': np.random.choice([4, 6, 8], n_samples),
            'Horsepower': np.random.randint(100, 500, n_samples),
            'MPG_City': np.random.randint(15, 35, n_samples),
            'MPG_Highway': np.random.randint(20, 45, n_samples),
            'Weight': np.random.randint(2500, 5500, n_samples),
            'Wheelbase': np.random.randint(95, 130, n_samples),
            'Length': np.random.randint(170, 220, n_samples),
        }
        
        # Create realistic prices
        data['MSRP'] = (
            20000 +
            data['EngineSize'] * 3000 +
            data['Horsepower'] * 50 +
            (data['Cylinders'] - 4) * 2000 +
            np.random.normal(0, 5000, n_samples)
        )
        data['MSRP'] = np.maximum(data['MSRP'], 10000)
        
        return pd.DataFrame(data)
    
    def train_model(self):
        X = self.df.drop('MSRP', axis=1)
        y = self.df['MSRP']
        
        numerical_cols = ['EngineSize', 'Cylinders', 'Horsepower', 'MPG_City', 
                         'MPG_Highway', 'Weight', 'Wheelbase', 'Length']
        categorical_cols = ['Make', 'Type', 'Origin', 'DriveTrain']
        
        preprocessor = ColumnTransformer([
            ('num', StandardScaler(), numerical_cols),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_cols)
        ])
        
        self.model = Pipeline([
            ('preprocessor', preprocessor),
            ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
        ])
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        self.model.fit(X_train, y_train)
        
        y_pred = self.model.predict(X_test)
        st.sidebar.success(f"Model trained! R²: {r2_score(y_test, y_pred):.3f}")
    
    def create_dashboard(self):
        # Input form
        with st.sidebar:
            st.header("Car Specifications")
            make = st.selectbox("Make", sorted(self.df['Make'].unique()))
            car_type = st.selectbox("Type", sorted(self.df['Type'].unique()))
            horsepower = st.slider("Horsepower", 100, 500, 200)
            engine_size = st.slider("Engine Size (L)", 1.0, 6.0, 2.5, 0.1)
            
            if st.button("Predict Price", type="primary"):
                input_data = pd.DataFrame([{
                    'Make': make, 'Type': car_type, 'Origin': 'Asia',
                    'DriveTrain': 'Front', 'EngineSize': engine_size,
                    'Cylinders': 6, 'Horsepower': horsepower,
                    'MPG_City': 20, 'MPG_Highway': 28,
                    'Weight': 3500, 'Wheelbase': 110, 'Length': 190
                }])
                
                prediction = self.model.predict(input_data)[0]
                st.success(f"Predicted Price: ${prediction:,.2f}")
        
        # Main area
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("Price Distribution")
            fig = px.histogram(self.df, x='MSRP', nbins=30)
            st.plotly_chart(fig, use_container_width=True)
        
        with col2:
            st.subheader("Price by Make")
            avg_prices = self.df.groupby('Make')['MSRP'].mean().sort_values()
            fig = px.bar(avg_prices, x=avg_prices.values, y=avg_prices.index, orientation='h')
            st.plotly_chart(fig, use_container_width=True)

# Run the app
if __name__ == "__main__":
    dashboard = CarPriceDashboard()
    dashboard.create_dashboard()
