import React, {useContext} from 'react'
import Header from './Header'
import './NeedHelp.css'
import InstructionCard from './InstructionCard'
import LaborumCard from './LaborumCard'
import DoloreCard from './DoloreCard'
import GeneralContainer from './GeneralContainer'
import { UserContext } from './UserContext'

const NeedHelp = () => {

  const {user} = useContext(UserContext);
  return (
    <div>
        <Header userName = {user.name} userType = {user.userType} />
        <main className="need-help">
            <div className="need-help-head">
                <h2>Frequently Asked Questions</h2>
                <p>Home / Frequently Asked Questions</p>
            </div> 
    
                <div className='card-row'>
                        <GeneralContainer />
                        <InstructionCard/>
                    </div>

                <div className='card-row'>
                      <LaborumCard />
                      <DoloreCard />
                </div>
        </main>
        <p style={{textAlign:'center' , color :'#012970'}}><b>@ Zircar Refractories. All Rights Reserved</b></p>

    </div>
  )
}

export default NeedHelp

