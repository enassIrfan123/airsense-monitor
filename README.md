Air pollution has emerged as a critical environmental and public health concern due to rapid 
urbanization, industrial growth, and increased vehicular emissions. Accurate and timely 
assessment of air quality is essential for minimizing health risks and enabling informed 
decision making. This project presents the design and implementation of AirSense, an 
intelligent environmental monitoring platform that integrates machine learning based Air 
Quality Index prediction with real time indoor and outdoor air quality monitoring. The 
system aims to provide users with actionable air quality insights by combining predictive 
analytics with live sensor data through accessible web and mobile interfaces. 
The proposed system employs a Random Forest Regressor model trained on historical air 
pollutant data, including PM₂.₅, PM₁₀, SO₂, NO₂, O₃, and CO, to predict AQI values. Real 
time outdoor data is retrieved through the OpenWeather API, while indoor air quality data 
is collected using IoT sensors such as MQ 2, MQ 135, DHT 11, BMP 180, and an ESP 32 
microcontroller. The trained model is deployed on cloud infrastructure using Firebase and 
Render, exposing a REST based /predict endpoint that processes live sensor inputs. The 
AirSense platform consists of multiple modules including data acquisition, cloud storage, 
AQI prediction, alert generation, and user visualization through web and mobile 
applications. 
System testing and evaluation were conducted to assess the predictive performance and 
functional reliability of the platform. The machine learning model achieved a Mean 
Absolute Error of 40.24 and an R squared value of 0.77, indicating strong predictive 
accuracy and robustness. Functional testing confirmed successful real time data 
transmission from IoT devices, seamless API integration, and stable cloud deployment. 
User interface testing validated the correct visualization of AQI values, historical trends, 
and health-based alerts aligned with EPA standards. 
In conclusion, AirSense demonstrates an effective integration of machine learning driven 
AQI prediction with continuous indoor and outdoor air quality monitoring. The platform 
provides meaningful insights that support personal health management and environmental 
awareness while offering scalability for urban planning applications. Future enhancements 
include the adoption of federated learning for improved model generalization and expanded 
sensor support for volatile organic compounds, further strengthening the system’s impact 
and adaptability
