import React, { useEffect, useState } from 'react'
import axios from 'axios'


const Subscriber = ({ userTo, userFrom }) => {

    const [SubscribeNumber, setSubscribeNumber ] = useState(0)
    const [Subscribed, setSubscribed] = useState(false)


    const subscribeNumberVariables = { userTo, userFrom}

    const onSubscribe = () => {

        let subscribeVariables = { userTo, userFrom }
       
  

    if(Subscribed) {
        //when we are already subscribed
        axios.post('/api/subscribe/unSubscribe', subscribeVariables)
            .then(response => {
                if(response.data.success) {
                    setSubscribeNumber(SubscribeNumber - 1)
                    setSubscribed(!Subscribed)
                } else {
                    alert('Failed to unsubscribed')
                }
            })

    } else {
        // when we are not subscribed

        axios.post('/api/subscribe/subscribe', subscribeVariables)
            .then(response => {
                if(response.data.success) {
                    setSubscribeNumber(SubscribeNumber + 1)
                    setSubscribed(!Subscribed)
                } else {
                    alert('Failed to subscribe')
                }
            })
    }

}
    useEffect(() => {

        // const subscribeNumberVariables = {userTo: userTo, userFrom: userFrom }
        axios.post('/api/subscribe/subscribeNumber', subscribeNumberVariables)
            .then(response => {
                if (response.data.success) {
                    setSubscribeNumber(response.data.subscribeNumber)
                } else {
                    alert('Failed to get subscriber Number')
                }
            })

        axios.post('/api/subscribe/subscribed', subscribeNumberVariables)
            .then(response => {
                if (response.data.success) {
                    setSubscribed(response.data.subscribed)
                } else {
                    alert('Failed to get Subscribed Information')
                }
            })

    }, [subscribeNumberVariables])


    return (
        <div>
            <button 
            onClick={onSubscribe}
            style={{
                backgroundColor: `${Subscribed ? '#AAAAAA' : '#CC0000'}`,
                borderRadius: '3px', color: 'white',
                padding: '10px 16px', fontWeight: '500', fontSize: '1rem', textTransform: 'uppercase'
            }}>
                {SubscribeNumber} {Subscribed ? 'Subscribed':
                    'Subscribe'}
            </button>
        </div>
    )

}
export default Subscriber