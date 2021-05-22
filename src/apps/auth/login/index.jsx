// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import React, { useState, useEffect } from "react"

import { user } from "actions";
import { withRouter, withActions, CenteredCard, CardContent } from "components";
import "./index.scss";

const Login = withRouter(withActions(({userAction, user, route, router}) => {

	const [ok, setOk] = useState(false)

	useEffect(() => {
		if (user !== undefined){
			if (route.hashParams.redirectTo !== undefined)
				router.navigateToUrl(route.hashParams.redirectTo)
			else
				router.navigateTo("/")
		}
		if (!ok){
			setOk(true)
			userAction({})
		}
	})

    return <CenteredCard className="kip-cm-wizard">
    	<CardContent>
    		Test
    	</CardContent>
    </CenteredCard>
}, [user]))

export default Login
