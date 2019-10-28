import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const api_key = '9456a00cc6bade612997961f941fc568';
const date = new Date();
const current_day = date.getDay();

class TitleCard extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            conditions: {
                "clear sky": "there is a clear sky.",
                "few clouds": "there are a few clouds.",
                "scattered clouds": "there are scattered clouds",
                "broken clouds": "there are broken clouds",
                "shower rain": "there are scattered showers",
                "rain": "it's rainy",
                "thunderstorm": "there were scattered thunderstorms",
                "snow": "there will be snow",
                "mist": "there is a gentle mist"
            }
        }
    }

    render(){
        return (
            <div className="titleCard">
                Today in {this.props.city}, {this.state.conditions[this.props.desc]}
            </div>
        );
    }
}

class DayCard extends React.Component{
    render(){
        return (
            <div className="dayCard">
                <p>{this.props.day}</p>
                <img src={`http://openweathermap.org/img/wn/${this.props.icon}@2x.png`} alt="forecast icon"/>
                <p>
                    {Math.round((
                        this.props.max * 1.8) + 32)}°F / {
                    Math.round((
                            this.props.min * 1.8) + 32)}°F
                </p>
            </div>
        );
    }
}

class WeekDisplay extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            maxValues: [],
            minValues: [],
            icons: [],
            day_abbv: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed"]  
        }

        this.getExtremes();
    }

    getExtremes = async () => {
        //fetching forecast data
        var api_call = await fetch(`http://api.openweathermap.org/data/2.5/forecast?q=Athens,us&appid=${api_key}&units=metric`);
        const forecastData = await api_call.json();
        console.log(forecastData);
        
        //get next info
        var length = forecastData.list.length;
        var min = forecastData.list[0].main.temp_min;
        var max = forecastData.list[0].main.temp_max;
        var maxTemp, minTemp, iconTemp;

        for(var i = 0; i < length; i++){
            if((i + 1) % 8 === 0){                
                maxTemp = this.state.maxValues.concat(max);
                minTemp = this.state.minValues.concat(min);
                iconTemp = this.state.icons.concat(forecastData.list[i].weather[0].icon);

                this.setState({
                    maxValues: maxTemp,
                    minValues: minTemp,
                    icons: iconTemp              
                });
                
                max = forecastData.list[i].main.temp_max;
                min = forecastData.list[i].main.temp_min;
            }else{
                if(forecastData.list[i].main.temp_max > max){
                    max = forecastData.list[i].main.temp_max;
                }
                if(forecastData.list[i].main.temp_min < min){
                    min = forecastData.list[i].main.temp_min;
                }
            }            
        }
    }

    render(){
        var dayCardElements = [];
        for(var day = 1; day < 5; day++){
            dayCardElements.push(
                <DayCard key={`day_${day}`} day={this.state.day_abbv[current_day + day]} min={this.state.minValues[day-1]} max={this.state.maxValues[day-1]} icon={this.state.icons[day-1]}/>
            );
        }

        return (
            <div className="weekDisplay">
                <DayCard day={this.state.day_abbv[current_day]} min={this.props.min} max={this.props.max} icon={this.props.firstIcon}/>
                {dayCardElements}
            </div>
        );
    }
}


class WeatherApp extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            city: undefined,
            description: undefined,
            todaysWeather: undefined,
            forecast: undefined,
            min_temp: undefined,
            max_temp: undefined,
            currentIcon: undefined
         }

         this.getWeather();
    }

    getWeather = async () => {
        var api_call = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=Athens,us&appid=${api_key}&units=metric`);
        const currentData = await api_call.json();

        console.log(currentData);
        this.setState({
            city: currentData.name,
            description: currentData.weather[0].description,
            min_temp: currentData.main.temp_min,
            max_temp: currentData.main.temp_max,
            currentIcon: currentData.weather[0].icon
        });
    }

    render(){
        return (
            <div className="app">
                <TitleCard desc={this.state.description} city={this.state.city}/>
                <WeekDisplay min={this.state.min_temp} max={this.state.max_temp} firstIcon={this.state.currentIcon}/>
            </div>
        );
    }
}

ReactDOM.render(<WeatherApp />, document.getElementById('root'));

