import React, {useState} from "react";

function useTestSetConstructor(){
    const [testSetUnlocked, setTestSetUnlocked] = useState(false)
    return {
        testSetUnlocked,
        unlockTestSet: () => setTestSetUnlocked(true)
    }
}

// create a context and a provider for the context
const TestSetContext = React.createContext({
    testSetUnlocked: false,
    unlockTestSet: () => {}
})

export function useTestSet(){
    return React.useContext(TestSetContext)
}

export function TestSetProvider({children}: { children: React.ReactNode }) {
    const {testSetUnlocked, unlockTestSet} = useTestSetConstructor()
    return (
        <TestSetContext.Provider value={{testSetUnlocked, unlockTestSet}}>
            {children}
        </TestSetContext.Provider>
    )
}